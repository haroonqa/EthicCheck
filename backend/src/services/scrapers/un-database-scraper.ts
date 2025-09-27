import axios from 'axios';
import * as cheerio from 'cheerio';

export interface UNDatabaseCompany {
  name: string;
  ticker: string | undefined;
  country: string | undefined;
  category: string;
  description: string;
  reportTitle: string;
  reportUrl: string;
  reportDate: Date;
  evidence: string[];
  sourceUrl: string;
  unResolution: string | undefined;
}

export interface UNDatabaseScrapingResult {
  companies: UNDatabaseCompany[];
  totalFound: number;
  errors: string[];
  scrapedAt: Date;
}

export class UNDatabaseScraper {
  private baseUrl = 'https://www.un.org/unispal';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrapeCompanies(maxPages: number = 10): Promise<UNDatabaseScrapingResult> {
    const companies: UNDatabaseCompany[] = [];
    const errors: string[] = [];

    try {
      console.log('🌐 Starting UN Database settlement reports scraping...');

      // Scrape main settlement reports page
      const mainPageCompanies = await this.scrapeMainReportsPage();
      companies.push(...mainPageCompanies);

      // Scrape additional report pages
      for (let page = 2; page <= maxPages; page++) {
        try {
          const pageCompanies = await this.scrapeReportsPage(page);
          if (pageCompanies.length === 0) break;
          companies.push(...pageCompanies);
          
          // Be polite - wait between requests
          await this.delay(3000);
        } catch (error) {
          console.log(`⚠️ Error scraping page ${page}:`, error);
          errors.push(`Page ${page}: ${error}`);
          break;
        }
      }

      console.log(`🎯 UN Database scraping complete! Found ${companies.length} companies`);

    } catch (error) {
      console.error('❌ Error in UN Database scraping:', error);
      errors.push(`Main scraping error: ${error}`);
    }

    return {
      companies,
      totalFound: companies.length,
      errors,
      scrapedAt: new Date()
    };
  }

  private async scrapeMainReportsPage(): Promise<UNDatabaseCompany[]> {
    const companies: UNDatabaseCompany[] = [];

    try {
      // Try multiple UNISPAL report URLs
      const reportUrls = [
        `${this.baseUrl}/documents/`,
        `${this.baseUrl}/documents/?wpv_view_count=4164&wpv_post_search=&wpv-wpcf-document-date_min=&wpv-wpcf-document-date_min-format=d-m-y&wpv-wpcf-document-date_max=&wpv-wpcf-document-date_max-format=d-m-y&wpv_sort_order=desc&wpv-document-subject%5B%5D=gaza-strip&wpv-wpcf-document-symbol=`,
        `${this.baseUrl}/documents/?wpv_view_count=4164&wpv_post_search=&wpv-wpcf-document-date_min=&wpv-wpcf-document-date_min-format=d-m-y&wpv-wpcf-document-date_max=&wpv-wpcf-document-date_max-format=d-m-y&wpv_sort_order=desc&wpv-document-subject%5B%5D=settlements&wpv-wpcf-document-symbol=`
      ];

      for (const url of reportUrls) {
        try {
          const response = await this.retryRequest(url);

          const $ = cheerio.load(response.data);
          
          // Look for report links that mention settlements or companies
          const reportLinks = $('a[href*="report"], a[href*="document"], a[href*="press"]');
          
          reportLinks.each((_, link) => {
            const linkText = $(link).text().toLowerCase();
            const href = $(link).attr('href');
            
            if (this.isRelevantReport(linkText) && href) {
              const company = this.parseReportLink($(link), url);
              if (company.name) {
                companies.push(company);
                console.log(`✅ Found UN report: ${company.reportTitle}`);
              }
            }
          });

        } catch (error) {
          console.log(`⚠️ Error scraping ${url}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error scraping main reports page:', error);
    }

    return companies;
  }

  private async scrapeReportsPage(pageNum: number): Promise<UNDatabaseCompany[]> {
    const companies: UNDatabaseCompany[] = [];

    try {
      const pageUrl = `${this.baseUrl}/documents/?wpv_paged=${pageNum}`;
      const response = await this.retryRequest(pageUrl);

      const $ = cheerio.load(response.data);
      const reportLinks = $('a[href*="document"], a[href*="report"], .document-link a');
      
      reportLinks.each((_, link) => {
        const linkText = $(link).text().toLowerCase();
        if (this.isRelevantReport(linkText)) {
          const company = this.parseReportLink($(link), pageUrl);
          if (company.name) {
            companies.push(company);
          }
        }
      });

    } catch (error) {
      console.error(`❌ Error scraping reports page ${pageNum}:`, error);
    }

    return companies;
  }

  private isRelevantReport(linkText: string): boolean {
    const relevantKeywords = [
      'settlement', 'occupied', 'palestinian', 'israeli', 'territory',
      'company', 'corporation', 'business', 'economic', 'exploitation',
      'construction', 'building', 'resource', 'service'
    ];
    
    return relevantKeywords.some(keyword => linkText.includes(keyword));
  }

  private parseReportLink(link: cheerio.Cheerio<any>, baseUrl: string): UNDatabaseCompany {
    const linkText = link.text().trim();
    const href = link.attr('href') || '';
    const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
    
    // Extract company name from report title
    const companyName = this.extractCompanyName(linkText);
    
    // Determine category based on report content
    const category = this.determineReportCategory(linkText);
    
    // Extract evidence from report title
    const evidence = this.extractEvidenceFromTitle(linkText);
    
    // Try to extract ticker
    const ticker = this.extractTicker(linkText);
    
    // Try to extract country
    const country = this.extractCountry(linkText);

    return {
      name: companyName || 'Unknown Company',
      ticker,
      country,
      category,
      description: linkText || 'UN report on settlement activities',
      reportTitle: linkText || 'UN Report',
      reportUrl: fullUrl,
      reportDate: new Date(), // Will be updated when scraping individual reports
      evidence,
      sourceUrl: this.baseUrl,
      unResolution: this.extractUNResolution(linkText)
    };
  }

  private extractCompanyName(text: string): string {
    // Look for company names in various formats
    const companyPatterns = [
      /(?:company|corporation|inc|llc|ltd)\s+([A-Z][a-zA-Z\s&]+)/i,
      /([A-Z][a-zA-Z\s&]+)\s+(?:company|corporation|inc|llc|ltd)/i,
      /([A-Z][a-zA-Z\s&]+)\s+involved/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no company pattern found, try to extract first capitalized words
    const words = text.split(' ').filter(word => /^[A-Z]/.test(word));
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    
    return 'Unknown Company';
  }

  private determineReportCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('settlement') || lowerText.includes('construction')) {
      return 'settlement_enterprise';
    } else if (lowerText.includes('economic') || lowerText.includes('exploitation')) {
      return 'economic_exploitation';
    } else if (lowerText.includes('resource') || lowerText.includes('production')) {
      return 'exploitation_occupied_resources';
    } else if (lowerText.includes('service') || lowerText.includes('bank') || lowerText.includes('utility')) {
      return 'services_to_settlements';
    } else if (lowerText.includes('construction') || lowerText.includes('building')) {
      return 'israeli_construction_occupied_land';
    } else {
      return 'other_bds_activities';
    }
  }

  private extractEvidenceFromTitle(text: string): string[] {
    const evidence: string[] = [];
    
    // Look for specific activities mentioned
    const activities = [
      'settlement construction', 'economic exploitation', 'resource extraction',
      'service provision', 'banking services', 'utility services'
    ];
    
    for (const activity of activities) {
      if (text.toLowerCase().includes(activity)) {
        evidence.push(`UN Report: ${activity}`);
      }
    }
    
    if (evidence.length === 0) {
      evidence.push(`UN Report: ${text.substring(0, 100)}...`);
    }
    
    return evidence;
  }

  private extractTicker(text: string): string | undefined {
    // Look for ticker patterns
    const tickerMatch = text.match(/\(([A-Z]{1,5})\)/) || 
                        text.match(/\b([A-Z]{1,5})\b/);
    
    return tickerMatch ? tickerMatch[1] : undefined;
  }

  private extractCountry(text: string): string | undefined {
    const countries = ['Israel', 'Palestine', 'United States', 'UK', 'Germany', 'France'];
    
    for (const country of countries) {
      if (text.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    
    return undefined;
  }

  private extractUNResolution(text: string): string | undefined {
    // Look for UN resolution numbers
    const resolutionMatch = text.match(/resolution\s+(\d+\/\d+)/i) ||
                           text.match(/res\.\s*(\d+\/\d+)/i);
    
    return resolutionMatch ? resolutionMatch[1] : undefined;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest(url: string, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt} for ${url}`);
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
          },
          timeout: 30000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500,
        });

        if (response.status === 200) {
          console.log(`✅ Success on attempt ${attempt}`);
          return response;
        }

        console.log(`⚠️ Status ${response.status} on attempt ${attempt}`);
        
        // Wait longer between retries
        if (attempt < maxRetries) {
          const waitTime = attempt * 5000; // 5s, 10s, 15s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }

      } catch (error: any) {
        console.log(`❌ Error on attempt ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 3000; // 3s, 6s, 9s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        } else {
          throw error;
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts`);
  }
}

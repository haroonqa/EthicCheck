import axios from 'axios';
import * as cheerio from 'cheerio';

export interface BDSMovementCompany {
  name: string;
  ticker: string | undefined;
  country: string | undefined;
  category: string;
  description: string;
  campaignUrl: string;
  evidence: string[];
  sourceUrl: string;
  lastUpdated: Date;
}

export interface BDSMovementScrapingResult {
  companies: BDSMovementCompany[];
  totalFound: number;
  errors: string[];
  scrapedAt: Date;
}

export class BDSMovementScraper {
  private baseUrl = 'https://bdsmovement.net';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrapeCompanies(maxPages: number = 10): Promise<BDSMovementScrapingResult> {
    const companies: BDSMovementCompany[] = [];
    const errors: string[] = [];

    try {
      console.log('🌐 Starting BDS Movement corporate campaign scraping...');

      // Scrape main campaigns page
      const mainPageCompanies = await this.scrapeMainCampaignsPage();
      companies.push(...mainPageCompanies);
      
      // Scrape join campaigns page
      const joinPageCompanies = await this.scrapeJoinCampaignsPage();
      companies.push(...joinPageCompanies);

      // Scrape additional campaign pages
      for (let page = 2; page <= maxPages; page++) {
        try {
          const pageCompanies = await this.scrapeCampaignPage(page);
          if (pageCompanies.length === 0) break;
          companies.push(...pageCompanies);
          
          // Be polite - wait between requests
          await this.delay(2000);
        } catch (error) {
          console.log(`⚠️ Error scraping page ${page}:`, error);
          errors.push(`Page ${page}: ${error}`);
          break;
        }
      }

      console.log(`🎯 BDS Movement scraping complete! Found ${companies.length} companies`);

    } catch (error) {
      console.error('❌ Error in BDS Movement scraping:', error);
      errors.push(`Main scraping error: ${error}`);
    }

    return {
      companies,
      totalFound: companies.length,
      errors,
      scrapedAt: new Date()
    };
  }

  private async scrapeMainCampaignsPage(): Promise<BDSMovementCompany[]> {
    const companies: BDSMovementCompany[] = [];

    try {
      const response = await this.retryRequest(`${this.baseUrl}/campaigns`);

      const $ = cheerio.load(response.data);
      
      // Look for campaign sections
      const campaignSections = $('.campaign-section, .corporate-campaign, article');
      
      campaignSections.each((_, section) => {
        const company = this.parseCampaignSection($(section));
        if (company.name) {
          companies.push(company);
          console.log(`✅ Found BDS campaign: ${company.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping main campaigns page:', error);
    }

    return companies;
  }

  private async scrapeJoinCampaignsPage(): Promise<BDSMovementCompany[]> {
    const companies: BDSMovementCompany[] = [];

    try {
      const response = await this.retryRequest(`${this.baseUrl}/join-a-bds-campaign`);

      const $ = cheerio.load(response.data);
      
      // Look for campaign sections
      const campaignSections = $('.campaign-section, .corporate-campaign, article, .campaign-item');
      
      campaignSections.each((_, section) => {
        const company = this.parseCampaignSection($(section));
        if (company.name) {
          companies.push(company);
          console.log(`✅ Found BDS join campaign: ${company.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping join campaigns page:', error);
    }

    return companies;
  }

  private async scrapeCampaignPage(pageNum: number): Promise<BDSMovementCompany[]> {
    const companies: BDSMovementCompany[] = [];

    try {
      const pageUrl = `${this.baseUrl}/get-involved/corporate-campaigns?page=${pageNum}`;
      const response = await this.retryRequest(pageUrl);

      const $ = cheerio.load(response.data);
      const campaignSections = $('.campaign-section, .corporate-campaign, article');
      
      campaignSections.each((_, section) => {
        const company = this.parseCampaignSection($(section));
        if (company.name) {
          companies.push(company);
        }
      });

    } catch (error) {
      console.error(`❌ Error scraping campaign page ${pageNum}:`, error);
    }

    return companies;
  }

  private parseCampaignSection(section: cheerio.Cheerio<any>): BDSMovementCompany {
    // Extract company name from various possible selectors
    const name = section.find('h1, h2, h3, .company-name, .campaign-title').first().text().trim();
    
    // Extract description
    const description = section.find('.description, .campaign-description, p').first().text().trim();
    
    // Extract category from campaign type
    const category = this.determineCampaignCategory(description, name);
    
    // Extract evidence from campaign details
    const evidence = this.extractEvidence(section);
    
    // Extract campaign URL
    const campaignUrl = section.find('a').first().attr('href') || '';
    const fullUrl = campaignUrl.startsWith('http') ? campaignUrl : `${this.baseUrl}${campaignUrl}`;
    
    // Try to extract ticker from company name or description
    const ticker = this.extractTicker(name, description);
    
    // Try to extract country information
    const country = this.extractCountry(description);

    return {
      name: name || 'Unknown Company',
      ticker,
      country,
      category,
      description: description || 'BDS campaign target',
      campaignUrl: fullUrl,
      evidence,
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private determineCampaignCategory(description: string, name: string): string {
    const text = `${description} ${name}`.toLowerCase();
    
    if (text.includes('settlement') || text.includes('construction')) {
      return 'settlement_enterprise';
    } else if (text.includes('economic') || text.includes('profit') || text.includes('exploitation')) {
      return 'economic_exploitation';
    } else if (text.includes('resource') || text.includes('production') || text.includes('sourcing')) {
      return 'exploitation_occupied_resources';
    } else if (text.includes('service') || text.includes('bank') || text.includes('utility')) {
      return 'services_to_settlements';
    } else if (text.includes('construction') || text.includes('building') || text.includes('land')) {
      return 'israeli_construction_occupied_land';
    } else {
      return 'other_bds_activities';
    }
  }

  private extractEvidence(section: cheerio.Cheerio<any>): string[] {
    const evidence: string[] = [];
    
    // Look for evidence in various selectors
    const evidenceElements = section.find('.evidence, .details, .campaign-details, ul li');
    
          evidenceElements.each((_, element) => {
        const text = section.find(element).text().trim();
        if (text.length > 20 && text.length < 500) { // Reasonable evidence length
          evidence.push(text);
        }
      });
    
    return evidence;
  }

  private extractTicker(name: string, description: string): string | undefined {
    // Look for ticker patterns like (TICKER) or TICKER in text
    const tickerMatch = name.match(/\(([A-Z]{1,5})\)/) || 
                        description.match(/\(([A-Z]{1,5})\)/) ||
                        name.match(/\b([A-Z]{1,5})\b/);
    
    return tickerMatch ? tickerMatch[1] : undefined;
  }

  private extractCountry(description: string): string | undefined {
    // Look for country mentions
    const countries = ['Israel', 'Palestine', 'United States', 'UK', 'Germany', 'France', 'Canada'];
    
    for (const country of countries) {
      if (description.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    
    return undefined;
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
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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

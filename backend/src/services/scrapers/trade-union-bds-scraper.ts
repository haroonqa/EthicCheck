import axios from 'axios';
import * as cheerio from 'cheerio';

export interface TradeUnionBDSCompany {
  name: string;
  ticker: string | undefined;
  country: string;
  sector: string;
  description: string;
  boycottType: string;
  evidence: string[];
  tradeUnion: string;
  sourceUrl: string;
  lastUpdated: Date;
}

export interface TradeUnionBDSScrapingResult {
  companies: TradeUnionBDSCompany[];
  totalFound: number;
  errors: string[];
  scrapedAt: Date;
}

export class TradeUnionBDSScraper {
  private baseUrl = 'https://bdsmovement.net';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrapeCompanies(maxPages: number = 5): Promise<TradeUnionBDSScrapingResult> {
    const companies: TradeUnionBDSCompany[] = [];
    const errors: string[] = [];

    try {
      console.log('🏭 Starting Trade Union BDS scraping...');

      // Scrape trade union solidarity campaigns
      const unionCampaigns = await this.scrapeUnionSolidarityCampaigns();
      companies.push(...unionCampaigns);

      // Scrape labor boycott campaigns
      const laborBoycotts = await this.scrapeLaborBoycottCampaigns();
      companies.push(...laborBoycotts);

      // Scrape worker solidarity campaigns
      const workerSolidarity = await this.scrapeWorkerSolidarityCampaigns();
      companies.push(...workerSolidarity);

      // Deduplicate companies based on name
      const uniqueCompanies = this.deduplicateCompanies(companies);
      console.log(`🎯 Trade Union BDS scraping complete! Found ${uniqueCompanies.length} unique companies (${companies.length} total)`);

    } catch (error) {
      console.error('❌ Error in Trade Union BDS scraping:', error);
      errors.push(`Main scraping error: ${error}`);
    }

    return {
      companies: this.deduplicateCompanies(companies),
      totalFound: this.deduplicateCompanies(companies).length,
      errors,
      scrapedAt: new Date()
    };
  }

  private async scrapeUnionSolidarityCampaigns(): Promise<TradeUnionBDSCompany[]> {
    const companies: TradeUnionBDSCompany[] = [];

    try {
      // Scrape the trade union solidarity page
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=68`);
      
      const $ = cheerio.load(response.data);
      
      // Look for trade union solidarity news articles
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const company = this.parseUnionSolidarityArticle($(article));
        if (company.name && company.name !== 'Unknown Company') {
          companies.push(company);
          console.log(`✅ Found union solidarity: ${company.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping union solidarity campaigns:', error);
    }

    return companies;
  }

  private async scrapeLaborBoycottCampaigns(): Promise<TradeUnionBDSCompany[]> {
    const companies: TradeUnionBDSCompany[] = [];

    try {
      // Scrape the labor boycott page
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=68`);
      
      const $ = cheerio.load(response.data);
      
      // Look for labor boycott news articles
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const company = this.parseLaborBoycottArticle($(article));
        if (company.name && company.name !== 'Unknown Company') {
          companies.push(company);
          console.log(`✅ Found labor boycott: ${company.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping labor boycott campaigns:', error);
    }

    return companies;
  }

  private async scrapeWorkerSolidarityCampaigns(): Promise<TradeUnionBDSCompany[]> {
    const companies: TradeUnionBDSCompany[] = [];

    try {
      // Scrape the worker solidarity page
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=68`);
      
      const $ = cheerio.load(response.data);
      
      // Look for worker solidarity news articles
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const company = this.parseWorkerSolidarityArticle($(article));
        if (company.name && company.name !== 'Unknown Company') {
          companies.push(company);
          console.log(`✅ Found worker solidarity: ${company.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping worker solidarity campaigns:', error);
    }

    return companies;
  }

  private parseUnionSolidarityArticle(article: cheerio.Cheerio<any>): TradeUnionBDSCompany {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    const sector = this.extractSector(description);
    const tradeUnion = this.extractTradeUnion(description);
    
    // Extract company name from title or description
    const name = this.extractCompanyName(title, description);

    return {
      name: name || 'Unknown Company',
      ticker,
      country: country || 'Unknown',
      sector: sector || 'Unknown',
      description: description || 'Trade union solidarity campaign target',
      boycottType,
      evidence,
      tradeUnion: tradeUnion || 'Unknown',
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private parseLaborBoycottArticle(article: cheerio.Cheerio<any>): TradeUnionBDSCompany {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    const sector = this.extractSector(description);
    const tradeUnion = this.extractTradeUnion(description);
    
    // Extract company name from title or description
    const name = this.extractCompanyName(title, description);

    return {
      name: name || 'Unknown Company',
      ticker,
      country: country || 'Unknown',
      sector: sector || 'Unknown',
      description: description || 'Labor boycott campaign target',
      boycottType,
      evidence,
      tradeUnion: tradeUnion || 'Unknown',
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private parseWorkerSolidarityArticle(article: cheerio.Cheerio<any>): TradeUnionBDSCompany {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    const sector = this.extractSector(description);
    const tradeUnion = this.extractTradeUnion(description);
    
    // Extract company name from title or description
    const name = this.extractCompanyName(title, description);

    return {
      name: name || 'Unknown Company',
      ticker,
      country: country || 'Unknown',
      sector: sector || 'Unknown',
      description: description || 'Worker solidarity campaign target',
      boycottType,
      evidence,
      tradeUnion: tradeUnion || 'Unknown',
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private determineBoycottType(description: string, name: string): string {
    const text = `${description} ${name}`.toLowerCase();
    
    if (text.includes('labor') || text.includes('worker') || text.includes('union')) {
      return 'labor_boycott';
    } else if (text.includes('strike') || text.includes('workplace') || text.includes('employment')) {
      return 'workplace_boycott';
    } else if (text.includes('solidarity') || text.includes('support') || text.includes('mobilization')) {
      return 'solidarity_campaign';
    } else if (text.includes('boycott') || text.includes('divestment') || text.includes('sanction')) {
      return 'general_boycott';
    } else {
      return 'labor_boycott';
    }
  }

  private extractEvidence(article: cheerio.Cheerio<any>): string[] {
    const evidence: string[] = [];
    
    const evidenceElements = article.find('.evidence, .details, .campaign-details, ul li');
    
    evidenceElements.each((_, element) => {
      const text = article.find(element).text().trim();
      if (text.length > 20 && text.length < 500) {
        evidence.push(text);
      }
    });
    
    return evidence;
  }

  private extractTicker(name: string, description: string): string | undefined {
    const tickerMatch = name.match(/\(([A-Z]{1,5})\)/) || 
                        description.match(/\(([A-Z]{1,5})\)/) ||
                        name.match(/\b([A-Z]{1,5})\b/);
    
    return tickerMatch ? tickerMatch[1] : undefined;
  }

  private extractCountry(description: string): string | undefined {
    const countries = ['United States', 'UK', 'Germany', 'France', 'Canada', 'Australia', 'Israel', 'Palestine'];
    
    for (const country of countries) {
      if (description.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    
    return undefined;
  }

  private extractSector(description: string): string | undefined {
    const sectors = [
      'Technology', 'Healthcare', 'Education', 'Transportation', 'Manufacturing',
      'Retail', 'Finance', 'Energy', 'Construction', 'Agriculture', 'Mining'
    ];
    
    for (const sector of sectors) {
      if (description.toLowerCase().includes(sector.toLowerCase())) {
        return sector;
      }
    }
    
    return undefined;
  }

  private extractTradeUnion(description: string): string | undefined {
    const unions = [
      'AFL-CIO', 'SEIU', 'Teamsters', 'UAW', 'AFSCME', 'NEA', 'AFT',
      'International Brotherhood of Electrical Workers', 'United Steelworkers'
    ];
    
    for (const union of unions) {
      if (description.toLowerCase().includes(union.toLowerCase())) {
        return union;
      }
    }
    
    return undefined;
  }

  private extractCompanyName(title: string, description: string): string {
    // Common company patterns
    const patterns = [
      /(?:Company|Corporation|Inc|LLC|Ltd|Limited)\s+([A-Z][a-z\s]+)/i,
      /([A-Z][a-z\s]+)\s+(?:Company|Corporation|Inc|LLC|Ltd|Limited)/i,
      /(?:The\s+)?([A-Z][a-z\s]+)\s+(?:Company|Corporation|Inc|LLC|Ltd|Limited)/i
    ];
    
    // Try to extract from title first
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Try to extract from description
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Look for specific companies mentioned in the text
    const companyKeywords = [
      'Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Tesla',
      'Walmart', 'Target', 'Home Depot', 'McDonald\'s', 'Starbucks'
    ];
    
    for (const company of companyKeywords) {
      if (title.toLowerCase().includes(company.toLowerCase()) || 
          description.toLowerCase().includes(company.toLowerCase())) {
        return company;
      }
    }
    
    // Clean up the title for better display
    let cleanTitle = title.replace(/^(Call to Boycott|Urgent Call|Keep Mobilizing|Palestinians Condemn|Road Closed|Activists Hold|Workers|Labor|Union|Solidarity|Mobilization|Campaign|Support|Boycott|Divestment|Sanction)/i, '').trim();
    
    if (cleanTitle.length > 0 && cleanTitle.length < 100) {
      return cleanTitle;
    }
    
    return title.substring(0, 50).trim(); // Fallback to truncated title
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
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 5000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }

      } catch (error: any) {
        console.log(`❌ Error on attempt ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 3000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        } else {
          throw error;
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private deduplicateCompanies(companies: TradeUnionBDSCompany[]): TradeUnionBDSCompany[] {
    const seen = new Set<string>();
    const unique: TradeUnionBDSCompany[] = [];
    
    for (const company of companies) {
      const key = company.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(company);
      }
    }
    
    return unique;
  }
}


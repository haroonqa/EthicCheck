import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PACBIAcademicInstitution {
  name: string;
  ticker: string | undefined;
  country: string;
  category: string;
  description: string;
  boycottType: string;
  evidence: string[];
  sourceUrl: string;
  lastUpdated: Date;
}

export interface PACBIScrapingResult {
  institutions: PACBIAcademicInstitution[];
  totalFound: number;
  errors: string[];
  scrapedAt: Date;
}

export class PACBIAcademicScraper {
  private baseUrl = 'https://bdsmovement.net';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async scrapeInstitutions(maxPages: number = 5): Promise<PACBIScrapingResult> {
    const institutions: PACBIAcademicInstitution[] = [];
    const errors: string[] = [];

    try {
      console.log('🎓 Starting PACBI academic boycott scraping...');

      // Scrape academic boycott campaigns
      const academicCampaigns = await this.scrapeAcademicCampaigns();
      institutions.push(...academicCampaigns);

      // Scrape research institution boycotts
      const researchBoycotts = await this.scrapeResearchBoycotts();
      institutions.push(...researchBoycotts);

      // Scrape university divestment campaigns
      const universityDivestments = await this.scrapeUniversityDivestments();
      institutions.push(...universityDivestments);

      // Deduplicate institutions based on name
      const uniqueInstitutions = this.deduplicateInstitutions(institutions);
      console.log(`🎯 PACBI academic scraping complete! Found ${uniqueInstitutions.length} unique institutions (${institutions.length} total)`);

    } catch (error) {
      console.error('❌ Error in PACBI academic scraping:', error);
      errors.push(`Main scraping error: ${error}`);
    }

    return {
      institutions: this.deduplicateInstitutions(institutions),
      totalFound: this.deduplicateInstitutions(institutions).length,
      errors,
      scrapedAt: new Date()
    };
  }

  private async scrapeAcademicCampaigns(): Promise<PACBIAcademicInstitution[]> {
    const institutions: PACBIAcademicInstitution[] = [];

    try {
      // Scrape the academic boycott news page
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=98`);
      
      const $ = cheerio.load(response.data);
      
      // Look for news articles about academic boycotts
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const institution = this.parseAcademicNewsArticle($(article));
        if (institution.name && institution.name !== 'Unknown Institution') {
          institutions.push(institution);
          console.log(`✅ Found academic boycott: ${institution.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping academic campaigns:', error);
    }

    return institutions;
  }

  private async scrapeResearchBoycotts(): Promise<PACBIAcademicInstitution[]> {
    const institutions: PACBIAcademicInstitution[] = [];

    try {
      // Scrape the PACBI page for research boycotts
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=141`);
      
      const $ = cheerio.load(response.data);
      
      // Look for PACBI-related news articles
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const institution = this.parsePACBINewsArticle($(article));
        if (institution.name && institution.name !== 'Unknown Institution') {
          institutions.push(institution);
          console.log(`✅ Found PACBI boycott: ${institution.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping research boycotts:', error);
    }

    return institutions;
  }

  private async scrapeUniversityDivestments(): Promise<PACBIAcademicInstitution[]> {
    const institutions: PACBIAcademicInstitution[] = [];

    try {
      const response = await this.retryRequest(`${this.baseUrl}/news?campaign=97`);
      
      const $ = cheerio.load(response.data);
      
      // Look for student solidarity news articles
      const newsArticles = $('.card, article, .news-item');
      
      newsArticles.each((_, article) => {
        const institution = this.parseStudentSolidarityArticle($(article));
        if (institution.name && institution.name !== 'Unknown Institution') {
          institutions.push(institution);
          console.log(`✅ Found student solidarity: ${institution.name}`);
        }
      });

    } catch (error) {
      console.error('❌ Error scraping university divestments:', error);
    }

    return institutions;
  }

  private parseAcademicNewsArticle(article: cheerio.Cheerio<any>): PACBIAcademicInstitution {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    
    // Extract institution name from title or description
    const name = this.extractInstitutionName(title, description);

    return {
      name: name || 'Unknown Institution',
      ticker,
      country: country || 'Unknown',
      category: 'academic_boycott',
      description: description || 'Academic boycott campaign target',
      boycottType,
      evidence,
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private parsePACBINewsArticle(article: cheerio.Cheerio<any>): PACBIAcademicInstitution {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    
    // Extract institution name from title or description
    const name = this.extractInstitutionName(title, description);

    return {
      name: name || 'Unknown Institution',
      ticker,
      country: country || 'Unknown',
      category: 'pacbi_boycott',
      description: description || 'PACBI boycott campaign target',
      boycottType,
      evidence,
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private parseStudentSolidarityArticle(article: cheerio.Cheerio<any>): PACBIAcademicInstitution {
    const title = article.find('.card-header-title a, h2 a, h3 a').first().text().trim();
    const description = article.find('p').first().text().trim();
    const boycottType = this.determineBoycottType(description, title);
    const evidence = this.extractEvidence(article);
    const country = this.extractCountry(description);
    const ticker = this.extractTicker(title, description);
    
    // Extract institution name from title or description
    const name = this.extractInstitutionName(title, description);

    return {
      name: name || 'Unknown Institution',
      ticker,
      country: country || 'Unknown',
      category: 'student_solidarity',
      description: description || 'Student solidarity campaign target',
      boycottType,
      evidence,
      sourceUrl: this.baseUrl,
      lastUpdated: new Date()
    };
  }

  private determineBoycottType(description: string, name: string): string {
    const text = `${description} ${name}`.toLowerCase();
    
    if (text.includes('academic') || text.includes('university') || text.includes('college')) {
      return 'academic_boycott';
    } else if (text.includes('research') || text.includes('laboratory') || text.includes('institute')) {
      return 'research_boycott';
    } else if (text.includes('divestment') || text.includes('endowment') || text.includes('investment')) {
      return 'financial_boycott';
    } else if (text.includes('partnership') || text.includes('collaboration') || text.includes('exchange')) {
      return 'partnership_boycott';
    } else {
      return 'academic_boycott';
    }
  }

  private extractEvidence(section: cheerio.Cheerio<any>): string[] {
    const evidence: string[] = [];
    
    const evidenceElements = section.find('.evidence, .details, .campaign-details, ul li');
    
    evidenceElements.each((_, element) => {
      const text = section.find(element).text().trim();
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

  private extractInstitutionName(title: string, description: string): string {
    // Common academic institution patterns
    const patterns = [
      /(?:University|College|Institute|School|Academy|Society)\s+of\s+([A-Z][a-z\s]+)/i,
      /([A-Z][a-z\s]+)\s+(?:University|College|Institute|School|Academy)/i,
      /(?:The\s+)?([A-Z][a-z\s]+)\s+(?:University|College|Institute|School|Academy)/i,
      /([A-Z][a-z\s]+)\s+(?:Research|Academic|Professional)\s+(?:Institute|Center|Foundation)/i
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
    
    // Look for specific institutions mentioned in the text
    const institutionKeywords = [
      'Columbia University', 'Pitzer College', 'European Society of Criminology',
      'Society of Psychotherapy Research', 'World Archaeological Congress',
      'Mohammed V University', 'Horizon Research Program', 'EU Research Program'
    ];
    
    for (const institution of institutionKeywords) {
      if (title.toLowerCase().includes(institution.toLowerCase()) || 
          description.toLowerCase().includes(institution.toLowerCase())) {
        return institution;
      }
    }
    
    // Fallback: extract first capitalized phrase that looks like an institution
    const words = title.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].match(/^[A-Z][a-z]+$/) && 
          words[i + 1].match(/^[A-Z][a-z]+$/)) {
        return `${words[i]} ${words[i + 1]}`;
      }
    }
    
    // Clean up the title for better display
    let cleanTitle = title.replace(/^(Call to Boycott|Urgent Call|Keep Mobilizing|Palestinians Condemn|Road Closed|Activists Hold|Imagine Dragons|Christina Aguilera|Argentinian star Fito Páez isn't playing apartheid|Pitzer College Closes Study Abroad Program With Complicit Haifa|World Archaeological Congress Excludes Scholar Affiliated With Illegal Israeli Settlement|academic boycott and divestment mobilizations by student and|scheduled to take place at Mohammed V|Global Sociologists|Palestinian Sociological|Israeli Sociological|Complicit Israeli|Criminology Is Normalizing a War Crime|Psychotherapy Research Over Complicity in Israel|Artists, academics, students, athletes: Escalate f)/i, '').trim();
    
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

  private deduplicateInstitutions(institutions: PACBIAcademicInstitution[]): PACBIAcademicInstitution[] {
    const seen = new Set<string>();
    const unique: PACBIAcademicInstitution[] = [];
    
    for (const institution of institutions) {
      const key = institution.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(institution);
      }
    }
    
    return unique;
  }
}

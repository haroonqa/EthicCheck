import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AFSCCompany {
  name: string;
  country: string | undefined;
  category: string | undefined;
  description: string | undefined;
  profileUrl: string | undefined;
  tags: string[];
  evidence: string[];
}

export interface AFSCScrapingResult {
  companies: AFSCCompany[];
  totalPages: number;
  scrapedAt: Date;
}

export class AFSCScraper {
  private baseUrl = 'https://investigate.afsc.org';
  private userAgent = 'EthicCheck-BDS-Data-Collector/1.0 (contact@ethiccheck.com)';

  async scrapeCompanies(maxPages: number = 10): Promise<AFSCScrapingResult> {
    const companies: AFSCCompany[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    console.log('🌐 Starting AFSC company scraping...');

    while (hasMorePages && currentPage <= maxPages) {
      try {
        console.log(`📄 Scraping page ${currentPage}...`);
        
        const pageUrl = `${this.baseUrl}/all-companies?page=${currentPage}`;
        const response = await axios.get(pageUrl, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const companyRows = $('.views-row'); // AFSC uses views-row for company entries

        if (companyRows.length === 0) {
          console.log(`No more companies found on page ${currentPage}`);
          hasMorePages = false;
          break;
        }

        for (let i = 0; i < companyRows.length; i++) {
          const row = companyRows.eq(i);
          const company = this.parseCompanyRow(row);
          
          if (company.name) {
            companies.push(company);
            console.log(`✅ Found company: ${company.name}`);
          }
        }

        // Check if there's a next page
        const nextPageLink = $('a[rel="next"], .next-page, .pagination .next');
        hasMorePages = nextPageLink.length > 0;
        
        currentPage++;
        
        // Be polite - wait between requests
        await this.delay(1000);
        
      } catch (error) {
        console.error(`❌ Error scraping page ${currentPage}:`, error);
        hasMorePages = false;
        break;
      }
    }

    console.log(`🎯 Scraping completed. Found ${companies.length} companies across ${currentPage - 1} pages.`);

    return {
      companies,
      totalPages: currentPage - 1,
      scrapedAt: new Date(),
    };
  }

  private parseCompanyRow(row: cheerio.Cheerio<any>): AFSCCompany {
    // Parse based on actual AFSC HTML structure
    const name = row.find('.views-field-title a').first().text().trim();
    const country = row.find('.views-field-field-company-headquarters .field-content').first().text().trim();
    const summary = row.find('.views-field-field-company-summary .field-content').first().text().trim();
    const profileLink = row.find('.views-field-title a').first();
    const profileUrl = profileLink.length ? profileLink.attr('href') : undefined;

    return {
      name: name || 'Unknown Company',
      country: country || undefined,
      category: undefined, // Will extract from tags
      description: summary || undefined,
      profileUrl: profileUrl ? `${this.baseUrl}${profileUrl}` : undefined,
      tags: this.extractTags(row),
      evidence: this.extractEvidence(row),
    };
  }

  private extractTags(row: cheerio.Cheerio<any>): string[] {
    const tags: string[] = [];
    
    // AFSC uses tag-icons with li.item elements
    row.find('.tag-icons .item a').each((_: number, el: any) => {
      const tag = cheerio.load(el).text().trim();
      if (tag) tags.push(tag);
    });

    return tags;
  }

  private extractEvidence(row: cheerio.Cheerio<any>): string[] {
    const evidence: string[] = [];
    
    // AFSC uses views-field-field-company-summary for company descriptions
    const summary = row.find('.views-field-field-company-summary .field-content').first().text().trim();
    if (summary) {
      evidence.push(summary);
    }

    return evidence;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

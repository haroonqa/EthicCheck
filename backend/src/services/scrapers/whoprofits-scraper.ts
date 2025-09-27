import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WhoProfitsCompany {
  name: string;
  ticker?: string | undefined;
  country?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  involvement?: string | undefined;
  sourceUrl: string;
}

export interface WhoProfitsScrapingResult {
  companies: WhoProfitsCompany[];
  totalFound: number;
  errors: string[];
}

export class WhoProfitsScraper {
  private baseUrl = 'https://whoprofits.org';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeCompanies(maxPages: number = 5): Promise<WhoProfitsScrapingResult> {
    const companies: WhoProfitsCompany[] = [];
    const errors: string[] = [];
    let totalFound = 0;

    try {
      console.log('🚀 Starting Who Profits scraping...');

      // Start with the main companies page
      const mainPageUrl = `${this.baseUrl}/companies`;
      console.log(`📄 Scraping main page: ${mainPageUrl}`);

      const mainPageCompanies = await this.scrapeMainPage(mainPageUrl);
      companies.push(...mainPageCompanies);
      totalFound += mainPageCompanies.length;

      console.log(`✅ Found ${mainPageCompanies.length} companies on main page`);

      // Add delay to be respectful
      await this.delay(2000);

      // Try to scrape additional pages if they exist
      for (let page = 2; page <= maxPages; page++) {
        try {
          const pageUrl = `${this.baseUrl}/companies?page=${page}`;
          console.log(`📄 Scraping page ${page}: ${pageUrl}`);
          
          const pageCompanies = await this.scrapeMainPage(pageUrl);
          if (pageCompanies.length === 0) {
            console.log(`📄 No more companies found on page ${page}, stopping`);
            break;
          }
          
          companies.push(...pageCompanies);
          totalFound += pageCompanies.length;
          
          console.log(`✅ Found ${pageCompanies.length} companies on page ${page}`);
          
          // Add delay between pages
          await this.delay(2000);
          
        } catch (error) {
          console.log(`⚠️  Error scraping page ${page}:`, error);
          errors.push(`Page ${page}: ${error}`);
          break;
        }
      }

      console.log(`🎯 Who Profits scraping complete! Total companies: ${totalFound}`);

    } catch (error) {
      console.error('❌ Error in Who Profits scraping:', error);
      errors.push(`Main scraping error: ${error}`);
    }

    return {
      companies,
      totalFound,
      errors
    };
  }

  private async scrapeMainPage(url: string): Promise<WhoProfitsCompany[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      const companies: WhoProfitsCompany[] = [];

      // Look for company listings - common patterns on Who Profits
      const companySelectors = [
        '.company-item',
        '.company-card',
        '.company-listing',
        '.company-row',
        'article.company',
        '.company-profile',
        '.company-entry'
      ];

      let companyElements: cheerio.Cheerio<any> | null = null;
      let selectorUsed = '';

      // Try different selectors
      for (const selector of companySelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          companyElements = elements;
          selectorUsed = selector;
          console.log(`✅ Found company elements using selector: ${selector} (${elements.length} items)`);
          break;
        }
      }

      if (!companyElements || companyElements.length === 0) {
        // Fallback: look for company-specific links
        console.log('🔍 No standard company selectors found, trying company-specific links...');
        const companyLinks = $('a[href*="/companies/company/"]');
        if (companyLinks.length > 0) {
          companyElements = companyLinks;
          selectorUsed = 'company-specific-links';
          console.log(`✅ Found ${companyLinks.length} company-specific links`);
        } else {
          // Try broader company links
          const fallbackElements = $('a[href*="/company/"], a[href*="/companies/"]');
          if (fallbackElements.length > 0) {
            companyElements = fallbackElements;
            selectorUsed = 'fallback-links';
            console.log(`✅ Found ${fallbackElements.length} potential company links`);
          }
        }
      }

      if (!companyElements || companyElements.length === 0) {
        console.log('❌ No company elements found on page');
        return [];
      }

      // Process each company element
      companyElements.each((index, element) => {
        try {
          const company = this.parseCompanyElement($, element, selectorUsed);
          if (company) {
            companies.push(company);
          }
        } catch (error) {
          console.error(`❌ Error parsing company element ${index}:`, error);
        }
      });

      console.log(`📊 Parsed ${companies.length} companies from page`);

      return companies;

    } catch (error) {
      console.error(`❌ Error scraping page ${url}:`, error);
      throw error;
    }
  }

  private parseCompanyElement($: cheerio.CheerioAPI, element: any, selectorType: string): WhoProfitsCompany | null {
    try {
      let name = '';
      let ticker = '';
      let country = '';
      let description = '';
      let category = '';
      let involvement = '';
      let sourceUrl = '';

      if (selectorType === 'company-specific-links') {
        // Handle company-specific link parsing
        const link = $(element);
        const href = link.attr('href');
        if (href) {
          sourceUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          name = link.text().trim() || 'Unknown Company';
          
          // Clean up the company name - remove extra text and symbols
          name = this.cleanCompanyNameFromLink(name);
        }
      } else if (selectorType === 'fallback-links') {
        // Handle fallback link parsing
        const link = $(element);
        const href = link.attr('href');
        if (href) {
          sourceUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          name = link.text().trim() || 'Unknown Company';
        }
      } else {
        // Standard company element parsing
        const companyElement = $(element);
        
        // Extract company name
        const nameSelectors = [
          'h1', 'h2', 'h3', 'h4', '.company-name', '.name', '.title', 'strong', 'b'
        ];
        for (const selector of nameSelectors) {
          const nameElement = companyElement.find(selector).first();
          if (nameElement.length > 0) {
            name = nameElement.text().trim();
            break;
          }
        }

        // Extract ticker (look for patterns like [TICKER] or (TICKER))
        const tickerMatch = name.match(/[\[\(]([A-Z]{1,5})[\]\)]/);
        if (tickerMatch) {
          ticker = tickerMatch[1];
          name = name.replace(/[\[\(][A-Z]{1,5}[\]\)]/, '').trim();
        }

        // Extract country
        const countrySelectors = ['.country', '.location', '.region', '.origin'];
        for (const selector of countrySelectors) {
          const countryElement = companyElement.find(selector);
          if (countryElement.length > 0) {
            country = countryElement.text().trim();
            break;
          }
        }

        // Extract description
        const descSelectors = ['.description', '.summary', '.about', '.details', 'p'];
        for (const selector of descSelectors) {
          const descElement = companyElement.find(selector);
          if (descElement.length > 0) {
            description = descElement.text().trim();
            break;
          }
        }

        // Extract category/involvement
        const categorySelectors = ['.category', '.type', '.sector', '.industry'];
        for (const selector of categorySelectors) {
          const catElement = companyElement.find(selector);
          if (catElement.length > 0) {
            category = catElement.text().trim();
            break;
          }
        }

        // Get source URL
        const linkElement = companyElement.find('a').first();
        if (linkElement.length > 0) {
          const href = linkElement.attr('href');
          if (href) {
            sourceUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          }
        }
      }

      // Clean up the data
      name = name || 'Unknown Company';
      if (name.length < 2) return null; // Skip invalid names

      // Create company object
      const company: WhoProfitsCompany = {
        name: name.trim(),
        ticker: ticker || undefined,
        country: country || undefined,
        description: description || undefined,
        category: category || undefined,
        involvement: involvement || undefined,
        sourceUrl: sourceUrl || this.baseUrl
      };

      return company;

    } catch (error) {
      console.error('❌ Error parsing company element:', error);
      return null;
    }
  }

  private cleanCompanyNameFromLink(name: string): string {
    // Clean up company names from Who Profits links
    return name
      .replace(/^[\[\(][A-Z]{1,5}[\]\)]\s*/, '') // Remove ticker brackets
      .replace(/['"`]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^Private\s*/, '') // Remove "Private" prefix
      .replace(/^Israel\s*/, '') // Remove "Israel" prefix
      .replace(/^Settlement Enterprise\s*/, '') // Remove "Settlement Enterprise" prefix
      .trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

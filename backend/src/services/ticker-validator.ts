import { PrismaClient } from '@prisma/client';

export interface TickerValidationResult {
  isValid: boolean;
  suggestedTicker?: string;
  confidence: number;
  reason: string;
}

export class TickerValidator {
  private prisma: PrismaClient;
  
  // Known ticker mappings for validation
  private static KNOWN_TICKERS = new Map<string, string>([
    // Tech
    ['apple', 'AAPL'], ['tesla', 'TSLA'], ['meta', 'META'], ['netflix', 'NFLX'],
    ['microsoft', 'MSFT'], ['google', 'GOOGL'], ['amazon', 'AMZN'], ['nvidia', 'NVDA'],
    ['intel', 'INTC'], ['amd', 'AMD'], ['oracle', 'ORCL'], ['adobe', 'ADBE'],
    ['cisco', 'CSCO'], ['salesforce', 'CRM'], ['palantir', 'PLTR'],
    
    // Consumer
    ['coca-cola', 'KO'], ['pepsi', 'PEP'], ['mcdonalds', 'MCD'], ['starbucks', 'SBUX'],
    ['disney', 'DIS'], ['walmart', 'WMT'], ['target', 'TGT'], ['kroger', 'KR'],
    
    // Financial
    ['jpmorgan', 'JPM'], ['bank of america', 'BAC'], ['wells fargo', 'WFC'],
    ['goldman sachs', 'GS'], ['morgan stanley', 'MS'], ['visa', 'V'], ['mastercard', 'MA'],
    ['berkshire hathaway', 'BRK-B'], ['us bancorp', 'USB'], ['pnc', 'PNC'],
    
    // Healthcare
    ['unitedhealth', 'UNH'], ['pfizer', 'PFE'], ['moderna', 'MRNA'], ['biontech', 'BNTX'],
    ['johnson & johnson', 'JNJ'], ['procter & gamble', 'PG'],
    
    // Industrial & Defense
    ['boeing', 'BA'], ['lockheed martin', 'LMT'], ['general electric', 'GE'],
    ['northrop grumman', 'NOC'], ['rtx', 'RTX'], ['raytheon', 'RTX'],
    ['general dynamics', 'GD'], ['bae systems', 'BAESY'],
    
    // Energy & Materials
    ['chevron', 'CVX'], ['valero', 'VLO'], ['volkswagen', 'VWAGY'], ['volvo', 'VOLV-B.ST'],
    ['cemex', 'CX'], ['solvay', 'SOLB.BR']
  ]);

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Validate a ticker assignment before saving
   */
  async validateTickerAssignment(companyName: string, proposedTicker: string): Promise<TickerValidationResult> {
    try {
      // Check 1: Is this ticker already assigned to another company?
      const existingCompany = await this.prisma.company.findFirst({
        where: {
          ticker: proposedTicker,
          active: true
        },
        select: { id: true, name: true }
      });

      if (existingCompany) {
        return {
          isValid: false,
          confidence: 0.9,
          reason: `Ticker ${proposedTicker} is already assigned to "${existingCompany.name}"`
        };
      }

      // Check 2: Does the company name match expected ticker patterns?
      const normalizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const expectedTicker = this.findExpectedTicker(normalizedName);
      
      if (expectedTicker && expectedTicker !== proposedTicker) {
        return {
          isValid: false,
          suggestedTicker: expectedTicker,
          confidence: 0.8,
          reason: `Company name suggests ticker should be ${expectedTicker}, not ${proposedTicker}`
        };
      }

      // Check 3: Is this a reasonable ticker format?
      if (!this.isValidTickerFormat(proposedTicker)) {
        return {
          isValid: false,
          confidence: 0.7,
          reason: `Ticker ${proposedTicker} doesn't match expected format`
        };
      }

      // Check 4: Check for similar company names that might be duplicates
      const similarCompanies = await this.findSimilarCompanies(companyName);
      if (similarCompanies.length > 0) {
        return {
          isValid: false,
          confidence: 0.6,
          reason: `Similar companies found: ${similarCompanies.map(c => c.name).join(', ')}`
        };
      }

      return {
        isValid: true,
        confidence: 0.9,
        reason: 'Ticker assignment appears valid'
      };

    } catch (error) {
      console.error('Error validating ticker:', error);
      return {
        isValid: false,
        confidence: 0.0,
        reason: 'Validation error occurred'
      };
    }
  }

  /**
   * Find expected ticker based on company name
   */
  private findExpectedTicker(normalizedName: string): string | null {
    for (const [key, ticker] of TickerValidator.KNOWN_TICKERS) {
      // More precise matching - require exact word boundaries for common words
      if (key === 'target' && normalizedName.includes('hospitality')) {
        // Skip target matching for hospitality companies
        continue;
      }
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return ticker;
      }
    }
    return null;
  }

  /**
   * Validate ticker format
   */
  private isValidTickerFormat(ticker: string): boolean {
    // Basic ticker format validation
    if (ticker.length < 1 || ticker.length > 10) return false;
    
    // Allow common patterns: AAPL, BRK-B, 002415.SZ, etc.
    const validPattern = /^[A-Z0-9\-\.]+$/;
    return validPattern.test(ticker);
  }

  /**
   * Find companies with similar names
   */
  private async findSimilarCompanies(companyName: string): Promise<Array<{id: string, name: string}>> {
    const words = companyName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (words.length === 0) return [];

    const similarCompanies = await this.prisma.company.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: words.map(word => ({
              name: { contains: word, mode: 'insensitive' }
            }))
          }
        ]
      },
      select: { id: true, name: true },
      take: 5
    });

    return similarCompanies;
  }

  /**
   * Auto-assign ticker based on company name
   */
  async autoAssignTicker(companyName: string): Promise<string | null> {
    const normalizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.findExpectedTicker(normalizedName);
  }

  /**
   * Get validation report for existing data
   */
  async getValidationReport(): Promise<{
    totalCompanies: number;
    companiesWithTickers: number;
    potentialIssues: Array<{
      companyName: string;
      ticker: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    const companies = await this.prisma.company.findMany({
      where: { active: true },
      select: { name: true, ticker: true }
    });

    const potentialIssues: Array<{
      companyName: string;
      ticker: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    for (const company of companies) {
      if (company.ticker) {
        // Check for format issues
        if (!this.isValidTickerFormat(company.ticker)) {
          potentialIssues.push({
            companyName: company.name,
            ticker: company.ticker,
            issue: 'Invalid ticker format',
            severity: 'high'
          });
        }

        // Check for naming mismatches
        const expectedTicker = await this.autoAssignTicker(company.name);
        if (expectedTicker && expectedTicker !== company.ticker) {
          potentialIssues.push({
            companyName: company.name,
            ticker: company.ticker,
            issue: `Expected ticker: ${expectedTicker}`,
            severity: 'medium'
          });
        }
      }
    }

    return {
      totalCompanies: companies.length,
      companiesWithTickers: companies.filter(c => c.ticker).length,
      potentialIssues
    };
  }
}

import { PrismaClient } from '@prisma/client';
import { TickerValidator, TickerValidationResult } from './ticker-validator';

export interface ImportValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestedTicker?: string;
}

export class DataImportGuard {
  private prisma: PrismaClient;
  private tickerValidator: TickerValidator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.tickerValidator = new TickerValidator(prisma);
  }

  /**
   * Validate company data before import
   */
  async validateCompanyImport(companyData: {
    name: string;
    ticker?: string;
    country?: string;
  }): Promise<ImportValidationResult> {
    const result: ImportValidationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Check 1: Company name validation
    if (!companyData.name || companyData.name.trim().length < 2) {
      result.isValid = false;
      result.errors.push('Company name is too short or missing');
    }

    // Check 2: Check for existing companies with similar names
    const similarCompanies = await this.findSimilarCompanies(companyData.name);
    if (similarCompanies.length > 0) {
      result.warnings.push(`Similar companies found: ${similarCompanies.map(c => c.name).join(', ')}`);
      
      // Check if any have tickers
      const withTickers = similarCompanies.filter(c => c.ticker);
      if (withTickers.length > 0) {
        result.warnings.push(`Consider using existing tickers: ${withTickers.map(c => `${c.name} (${c.ticker})`).join(', ')}`);
      }
    }

    // Check 3: Ticker validation
    if (companyData.ticker) {
      const tickerValidation = await this.tickerValidator.validateTickerAssignment(
        companyData.name, 
        companyData.ticker
      );

      if (!tickerValidation.isValid) {
        result.isValid = false;
        result.errors.push(tickerValidation.reason);
        
        if (tickerValidation.suggestedTicker) {
          result.suggestedTicker = tickerValidation.suggestedTicker;
          result.warnings.push(`Suggested ticker: ${tickerValidation.suggestedTicker}`);
        }
      }
    } else {
      // Auto-suggest ticker if none provided
      const suggestedTicker = await this.tickerValidator.autoAssignTicker(companyData.name);
      if (suggestedTicker) {
        result.suggestedTicker = suggestedTicker;
        result.warnings.push(`No ticker provided. Suggested: ${suggestedTicker}`);
      }
    }

    // Check 4: Country validation
    if (companyData.country && companyData.country.length > 50) {
      result.warnings.push('Country name seems unusually long');
    }

    return result;
  }

  /**
   * Safe company creation with validation
   */
  async createCompanySafely(companyData: {
    name: string;
    ticker?: string;
    country?: string;
    active?: boolean;
  }): Promise<{ success: boolean; companyId?: string; warnings: string[]; errors: string[] }> {
    const validation = await this.validateCompanyImport(companyData);
    
    if (!validation.isValid) {
      return {
        success: false,
        warnings: validation.warnings,
        errors: validation.errors
      };
    }

    try {
      // Use suggested ticker if available and no ticker provided
      const finalTicker = companyData.ticker || validation.suggestedTicker;
      
      const company = await this.prisma.company.create({
        data: {
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: companyData.name.trim(),
          ticker: finalTicker || null,
          country: companyData.country?.trim() || null,
          active: companyData.active ?? true
        }
      });

      return {
        success: true,
        companyId: company.id,
        warnings: validation.warnings,
        errors: []
      };

    } catch (error) {
      console.error('Error creating company:', error);
      return {
        success: false,
        warnings: validation.warnings,
        errors: [`Database error: ${error}`]
      };
    }
  }

  /**
   * Safe company update with validation
   */
  async updateCompanySafely(
    companyId: string, 
    updates: { name?: string; ticker?: string; country?: string }
  ): Promise<{ success: boolean; warnings: string[]; errors: string[] }> {
    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true, ticker: true }
      });

      if (!existingCompany) {
        return {
          success: false,
          warnings: [],
          errors: ['Company not found']
        };
      }

      // Validate ticker changes
      if (updates.ticker && updates.ticker !== existingCompany.ticker) {
        const tickerValidation = await this.tickerValidator.validateTickerAssignment(
          updates.name || existingCompany.name,
          updates.ticker
        );

        if (!tickerValidation.isValid) {
          return {
            success: false,
            warnings: [],
            errors: [tickerValidation.reason]
          };
        }
      }

      // Perform update
      await this.prisma.company.update({
        where: { id: companyId },
        data: updates
      });

      return {
        success: true,
        warnings: [],
        errors: []
      };

    } catch (error) {
      console.error('Error updating company:', error);
      return {
        success: false,
        warnings: [],
        errors: [`Database error: ${error}`]
      };
    }
  }

  /**
   * Find similar companies
   */
  private async findSimilarCompanies(companyName: string): Promise<Array<{id: string, name: string, ticker?: string}>> {
    const words = companyName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (words.length === 0) return [];

    const companies = await this.prisma.company.findMany({
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
      select: { id: true, name: true, ticker: true },
      take: 5
    });

    // Convert null tickers to undefined for consistency
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      ...(company.ticker && { ticker: company.ticker })
    }));
  }

  /**
   * Get data quality report
   */
  async getDataQualityReport(): Promise<{
    totalCompanies: number;
    companiesWithTickers: number;
    tickerCoverage: number;
    potentialDuplicates: number;
    validationIssues: number;
  }> {
    const companies = await this.prisma.company.findMany({
      where: { active: true },
      select: { name: true, ticker: true }
    });

    const tickerValidation = await this.tickerValidator.getValidationReport();
    
    // Count potential duplicates
    const potentialDuplicates = await this.countPotentialDuplicates();

    return {
      totalCompanies: companies.length,
      companiesWithTickers: companies.filter(c => c.ticker).length,
      tickerCoverage: (companies.filter(c => c.ticker).length / companies.length) * 100,
      potentialDuplicates,
      validationIssues: tickerValidation.potentialIssues.length
    };
  }

  /**
   * Count potential duplicate companies
   */
  private async countPotentialDuplicates(): Promise<number> {
    const result = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM (
        SELECT LOWER(name) as normalized_name, COUNT(*) as name_count
        FROM company 
        WHERE active = true 
        GROUP BY LOWER(name)
        HAVING COUNT(*) > 1
      ) as duplicates
    `;
    
    return Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0;
  }
}

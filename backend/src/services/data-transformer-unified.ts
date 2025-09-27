
import { company, evidence, source, tag, EvidenceStrength } from '@prisma/client';
import { AFSCScrapingResult } from './scrapers/afsc-scraper';
import { WhoProfitsScrapingResult } from './scrapers/whoprofits-scraper';
import { PACBIScrapingResult } from './scrapers/pacbi-academic-scraper';
import { TradeUnionBDSScrapingResult } from './scrapers/trade-union-bds-scraper';
import { UNDatabaseScrapingResult } from './scrapers/un-database-scraper';

export interface TransformedCompany {
  name: string;
  ticker?: string | undefined;
  country?: string | undefined;
  sector?: string | undefined;
  description?: string | undefined;
  evidence: TransformedEvidence[];
  alias?: string[] | undefined;
  source: string;
  last_updated: Date;
}

export interface TransformedEvidence {
  text: string;
  strength: EvidenceStrength;
  category: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDomain: string;
  bdsCategory?: string | undefined;
  notes?: string | undefined;
}

export interface UnifiedTransformationResult {
  companies: TransformedCompany[];
  totalCompanies: number;
  totalEvidence: number;
  sources: string[];
  errors: string[];
  transformedAt: Date;
}

export class UnifiedBDSDataTransformer {
  
  async transformAllSources(
    afscData?: AFSCScrapingResult,
    whoProfitsData?: WhoProfitsScrapingResult,
    pacbiData?: PACBIScrapingResult,
    tradeUnionData?: TradeUnionBDSScrapingResult,
    unData?: UNDatabaseScrapingResult
  ): Promise<UnifiedTransformationResult> {
    
    const companies: TransformedCompany[] = [];
    const errors: string[] = [];
    const sources: string[] = [];

    try {
      console.log('🔄 Starting unified BDS data transformation...');

      // Transform AFSC data
      if (afscData && afscData.companies.length > 0) {
        console.log(`📊 Transforming ${afscData.companies.length} AFSC companies...`);
        const afscTransformed = this.transformAFSCData(afscData);
        companies.push(...afscTransformed);
        sources.push('AFSC Investigate');
      }

      // Transform Who Profits data
      if (whoProfitsData && whoProfitsData.companies.length > 0) {
        console.log(`📊 Transforming ${whoProfitsData.companies.length} Who Profits companies...`);
        const whoProfitsTransformed = this.transformWhoProfitsData(whoProfitsData);
        companies.push(...whoProfitsTransformed);
        sources.push('Who Profits');
      }

      // Transform PACBI Academic data
      if (pacbiData && pacbiData.institutions.length > 0) {
        console.log(`📊 Transforming ${pacbiData.institutions.length} PACBI academic institutions...`);
        const pacbiTransformed = this.transformPACBIData(pacbiData);
        companies.push(...pacbiTransformed);
        sources.push('PACBI Academic Boycotts');
      }

      // Transform Trade Union BDS data
      if (tradeUnionData && tradeUnionData.companies.length > 0) {
        console.log(`📊 Transforming ${tradeUnionData.companies.length} Trade Union BDS companies...`);
        const tradeUnionTransformed = this.transformTradeUnionData(tradeUnionData);
        companies.push(...tradeUnionTransformed);
        sources.push('Trade Union BDS Campaigns');
      }

      // Transform UN Database data
      if (unData && unData.companies.length > 0) {
        console.log(`📊 Transforming ${unData.companies.length} UN Database companies...`);
        const unTransformed = this.transformUNDatabaseData(unData);
        companies.push(...unTransformed);
        sources.push('UN Database Settlement Reports');
      }

      // Deduplicate companies based on name
      const uniqueCompanies = this.deduplicateCompanies(companies);
      
      console.log(`✅ Transformation complete! ${uniqueCompanies.length} unique companies from ${sources.length} sources`);

      return {
        companies: uniqueCompanies,
        totalCompanies: uniqueCompanies.length,
        totalEvidence: uniqueCompanies.reduce((sum, company) => sum + company.evidence.length, 0),
        sources,
        errors,
        transformedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Error in unified transformation:', error);
      errors.push(`Unified transformation error: ${error}`);
      
      return {
        companies: [],
        totalCompanies: 0,
        totalEvidence: 0,
        sources: [],
        errors,
        transformedAt: new Date()
      };
    }
  }

  private transformAFSCData(data: AFSCScrapingResult): TransformedCompany[] {
    return data.companies.map(company => ({
      name: company.name,
      ticker: undefined, // AFSC doesn't have tickers
      country: company.country || 'Unknown',
      sector: undefined, // AFSC doesn't have sector
      description: company.description || 'No description available',
      evidence: company.evidence.map(evidence => ({
        text: evidence, // AFSC evidence is just strings
        strength: 'MEDIUM' as const, // Default to medium
        category: 'BDS',
        sourceUrl: company.profileUrl || 'https://investigate.afsc.org',
        sourceTitle: 'AFSC Investigate',
        sourceDomain: 'investigate.afsc.org',
        bdsCategory: undefined,
        notes: undefined
      })),
      alias: company.tags || [], // Use tags as aliases
      source: 'AFSC Investigate',
      last_updated: data.scrapedAt
    }));
  }

  private transformWhoProfitsData(data: WhoProfitsScrapingResult): TransformedCompany[] {
    return data.companies.map(company => ({
      name: company.name,
      ticker: company.ticker || undefined,
      country: company.country || 'Unknown',
      sector: company.category || undefined, // Use category as sector
      description: company.description || company.involvement || 'No description available',
      evidence: [{
        text: company.involvement || 'Company involved in BDS activities',
        strength: 'HIGH' as const, // Who Profits is authoritative
        category: 'BDS',
        sourceUrl: company.sourceUrl,
        sourceTitle: 'Who Profits',
        sourceDomain: 'whoprofits.org',
        bdsCategory: company.category,
        notes: company.involvement
      }],
      alias: [],
      source: 'Who Profits',
      last_updated: new Date() // Who Profits doesn't have scrapedAt
    }));
  }

  private transformPACBIData(data: PACBIScrapingResult): TransformedCompany[] {
    return data.institutions.map(institution => ({
      name: institution.name,
      ticker: institution.ticker,
      country: institution.country,
      sector: 'Education',
      description: institution.description,
      evidence: institution.evidence.map(evidence => ({
        text: evidence,
        strength: 'MEDIUM' as EvidenceStrength,
        category: 'BDS',
        sourceUrl: institution.sourceUrl,
        sourceTitle: `PACBI ${institution.category}`,
        sourceDomain: 'bdsmovement.net',
        bdsCategory: this.mapPACBICategory(institution.category),
        notes: `Academic boycott type: ${institution.boycottType}`
      })),
      alias: [institution.name],
      source: 'PACBI Academic Boycotts',
      last_updated: data.scrapedAt
    }));
  }

  private transformTradeUnionData(data: TradeUnionBDSScrapingResult): TransformedCompany[] {
    return data.companies.map(company => ({
      name: company.name,
      ticker: company.ticker,
      country: company.country,
      sector: company.sector,
      description: company.description,
      evidence: company.evidence.map(evidence => ({
        text: evidence,
        strength: 'MEDIUM' as EvidenceStrength,
        category: 'BDS',
        sourceUrl: company.sourceUrl,
        sourceTitle: `Trade Union ${company.boycottType}`,
        sourceDomain: 'bdsmovement.net',
        bdsCategory: this.mapTradeUnionCategory(company.boycottType),
        notes: `Trade Union: ${company.tradeUnion}`
      })),
      alias: [company.name],
      source: 'Trade Union BDS Campaigns',
      last_updated: data.scrapedAt
    }));
  }

  private transformUNDatabaseData(data: UNDatabaseScrapingResult): TransformedCompany[] {
    return data.companies.map(company => ({
      name: company.name,
      ticker: company.ticker,
      country: company.country,
      sector: 'Government/International',
      description: company.description,
      evidence: company.evidence.map(evidence => ({
        text: evidence,
        strength: 'HIGH' as EvidenceStrength,
        category: 'BDS',
        sourceUrl: company.reportUrl,
        sourceTitle: company.reportTitle,
        sourceDomain: 'un.org',
        bdsCategory: company.category,
        notes: company.unResolution ? `UN Resolution: ${company.unResolution}` : undefined
      })),
      alias: [company.name],
      source: 'UN Database Settlement Reports',
      last_updated: data.scrapedAt
    }));
  }

  private mapEvidenceStrength(strength: string): EvidenceStrength {
    switch (strength.toLowerCase()) {
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  private mapPACBICategory(category: string): string {
    switch (category) {
      case 'academic_boycott':
        return 'academic_boycott';
      case 'research_boycott':
        return 'research_boycott';
      case 'university_divestment':
        return 'financial_boycott';
      case 'student_solidarity':
        return 'student_campaigns';
      default:
        return 'other_bds_activities';
    }
  }

  private mapTradeUnionCategory(category: string): string {
    switch (category) {
      case 'labor_boycott':
        return 'labor_boycott';
      case 'workplace_boycott':
        return 'workplace_boycott';
      case 'solidarity_campaign':
        return 'solidarity_campaigns';
      case 'general_boycott':
        return 'general_boycott';
      default:
        return 'other_bds_activities';
    }
  }

  private deduplicateCompanies(companies: TransformedCompany[]): TransformedCompany[] {
    const seen = new Map<string, TransformedCompany>();
    
    for (const company of companies) {
      const key = company.name.toLowerCase().trim();
      
      if (seen.has(key)) {
        // Merge evidence from duplicate companies
        const existing = seen.get(key)!;
        existing.evidence.push(...company.evidence);
        
        // Merge aliases
        if (company.alias) {
          existing.alias = [...(existing.alias || []), ...company.alias];
        }
        
        // Update source to show multiple sources
        existing.source = `${existing.source}, ${company.source}`;
      } else {
        seen.set(key, { ...company });
      }
    }
    
    return Array.from(seen.values());
  }
}


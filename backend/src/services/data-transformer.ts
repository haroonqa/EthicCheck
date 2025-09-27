import { AFSCCompany } from './scrapers/afsc-scraper';

export interface TransformedCompany {
  name: string;
  ticker: string | undefined;
  country: string | undefined;
  cik: string | undefined;
  isin: string | undefined;
  figi: string | undefined;
  tags: string[];
  evidence: TransformedEvidence[];
}

export interface TransformedEvidence {
  tagName: string;
  strength: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  sourceUrl: string;
  publishedAt?: Date;
  companyName: string; // Company name for easier matching
  bdsCategory?: string; // BDS category if applicable
}

export interface TransformedSource {
  domain: string;
  title: string;
  url: string;
  publisher: string;
}

export class DataTransformer {
  
  /**
   * Transform AFSC scraped data to database schema
   */
  transformAFSCData(afscCompanies: AFSCCompany[]): {
    companies: TransformedCompany[];
    sources: TransformedSource[];
    companyEvidenceMap: Map<string, TransformedEvidence[]>; // Map company name to evidence
  } {
    console.log('🔄 Transforming AFSC data...');
    
    const companies: TransformedCompany[] = [];
    const sources: TransformedSource[] = [];
    const companyEvidenceMap = new Map<string, TransformedEvidence[]>();
    
    // Create AFSC source
    const afscSource: TransformedSource = {
      domain: 'investigate.afsc.org',
      title: 'American Friends Service Committee - Investigate',
      url: 'https://investigate.afsc.org',
      publisher: 'AFSC',
    };
    sources.push(afscSource);
    
    // Transform each company
    afscCompanies.forEach((afscCompany, index) => {
      // Create company
      const company: TransformedCompany = {
        name: afscCompany.name,
        ticker: undefined,
        country: afscCompany.country,
        cik: undefined,
        isin: undefined,
        figi: undefined,
        tags: afscCompany.tags,
        evidence: [],
      };
      
      // Add evidence for each tag
      afscCompany.tags.forEach(tag => {
        const evidenceItem: TransformedEvidence = {
          tagName: this.mapAFSCTagToTagName(tag),
          strength: this.determineEvidenceStrength(afscCompany),
          notes: afscCompany.description || `Listed in AFSC ${tag} category`,
          sourceUrl: afscCompany.profileUrl || 'https://investigate.afsc.org',
          publishedAt: new Date(), // AFSC data is current
          companyName: afscCompany.name, // Add company name for easier matching
        };
        
        company.evidence.push(evidenceItem);
        
        // Add to company evidence map for easier database loading
        if (!companyEvidenceMap.has(afscCompany.name)) {
          companyEvidenceMap.set(afscCompany.name, []);
        }
        companyEvidenceMap.get(afscCompany.name)!.push(evidenceItem);
      });
      
      companies.push(company);
      
      if (index < 5) {
        console.log(`✅ Transformed: ${company.name} (${company.tags.join(', ')})`);
      }
    });
    
    console.log(`🎯 Transformation complete: ${companies.length} companies, ${companyEvidenceMap.size} companies with evidence`);
    
    return { companies, sources, companyEvidenceMap };
  }
  
  /**
   * Map AFSC tag names to your database tag names
   */
  private mapAFSCTagToTagName(afscTag: string): string {
    const tagMapping: Record<string, string> = {
      'Prisons': 'BDS',
      'Occupations': 'BDS', 
      'Borders': 'BDS',
      'Settlements': 'BDS',
      'Military': 'DEFENSE',
      'Arms': 'DEFENSE',
      'Surveillance': 'SURVEILLANCE',
      'Technology': 'SURVEILLANCE',
    };
    
    return tagMapping[afscTag] || 'BDS'; // Default to BDS for unknown tags
  }
  
  /**
   * Determine evidence strength based on company data
   */
  private determineEvidenceStrength(afscCompany: AFSCCompany): 'LOW' | 'MEDIUM' | 'HIGH' {
    // High strength if company has detailed description and multiple tags
    if (afscCompany.description && afscCompany.description.length > 100 && afscCompany.tags.length > 1) {
      return 'HIGH';
    }
    
    // Medium strength if company has description or multiple tags
    if (afscCompany.description || afscCompany.tags.length > 1) {
      return 'MEDIUM';
    }
    
    // Low strength for basic listings
    return 'LOW';
  }
  
  /**
   * Clean and normalize company names
   */
  cleanCompanyName(name: string): string {
    return name
      .replace(/\s+/, ' ') // Remove extra spaces
      .replace(/\.$/, '') // Remove trailing periods
      .trim();
  }
  
  /**
   * Extract potential ticker from company name
   */
  extractPotentialTicker(name: string): string | undefined {
    // Look for common ticker patterns
    const tickerMatch = name.match(/\b([A-Z]{1,5})\b/);
    if (tickerMatch && tickerMatch[1].length >= 2) {
      return tickerMatch[1];
    }
    return undefined;
  }
}

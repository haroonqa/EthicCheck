import { WhoProfitsCompany } from './scrapers/whoprofits-scraper';
import { BdsCategory } from '../types/api';

export interface TransformedWhoProfitsCompany {
  name: string;
  ticker?: string | undefined;
  country?: string | undefined;
  description?: string | undefined;
}

export interface TransformedWhoProfitsEvidence {
  companyName: string;
  tagName: string;
  bdsCategory?: BdsCategory | undefined;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string;
}

export interface TransformedWhoProfitsData {
  companies: TransformedWhoProfitsCompany[];
  evidence: TransformedWhoProfitsEvidence[];
  companyEvidenceMap: Map<string, TransformedWhoProfitsEvidence[]>;
}

export class WhoProfitsDataTransformer {
  
  transformWhoProfitsData(companies: WhoProfitsCompany[]): TransformedWhoProfitsData {
    const transformedCompanies: TransformedWhoProfitsCompany[] = [];
    const evidence: TransformedWhoProfitsEvidence[] = [];
    const companyEvidenceMap = new Map<string, TransformedWhoProfitsEvidence[]>();

    console.log(`🔄 Transforming ${companies.length} Who Profits companies...`);

    for (const company of companies) {
      try {
        // Transform company data
        const transformedCompany: TransformedWhoProfitsCompany = {
          name: this.cleanCompanyName(company.name),
          ticker: company.ticker || this.extractPotentialTicker(company.name),
          country: company.country || 'Unknown',
          description: company.description || company.involvement || 'BDS-related activities'
        };

        transformedCompanies.push(transformedCompany);

        // Create evidence for this company
        const companyEvidence = this.createEvidenceForCompany(company);
        evidence.push(...companyEvidence);

        // Add to company evidence map
        companyEvidenceMap.set(transformedCompany.name, companyEvidence);

      } catch (error) {
        console.error(`❌ Error transforming company ${company.name}:`, error);
      }
    }

    console.log(`✅ Transformed ${transformedCompanies.length} companies with ${evidence.length} evidence items`);

    return {
      companies: transformedCompanies,
      evidence,
      companyEvidenceMap
    };
  }

  private cleanCompanyName(name: string): string {
    // Remove common prefixes/suffixes and clean up
    return name
      .replace(/^[\[\(][A-Z]{1,5}[\]\)]\s*/, '') // Remove ticker brackets
      .replace(/\s+/, ' ') // Normalize whitespace
      .trim();
  }

  private extractPotentialTicker(name: string): string | undefined {
    // Look for ticker patterns like [TICKER] or (TICKER)
    const tickerMatch = name.match(/[\[\(]([A-Z]{1,5})[\]\)]/);
    return tickerMatch ? tickerMatch[1] : undefined;
  }

  private createEvidenceForCompany(company: WhoProfitsCompany): TransformedWhoProfitsEvidence[] {
    const evidence: TransformedWhoProfitsEvidence[] = [];

    // Extract domain from source URL
    const sourceDomain = this.extractDomain(company.sourceUrl);
    const sourceTitle = company.category || 'Who Profits Research';

    // Map involvement to specific BDS categories
    const bdsCategory = this.mapInvolvementToBdsCategory(company.involvement);

    // Create primary BDS evidence with specific category
    const primaryEvidence: TransformedWhoProfitsEvidence = {
      companyName: this.cleanCompanyName(company.name),
      tagName: 'BDS',
      bdsCategory,
      strength: this.determineEvidenceStrength(company),
      notes: this.createEvidenceNotes(company),
      sourceUrl: company.sourceUrl,
      sourceDomain,
      sourceTitle
    };

    evidence.push(primaryEvidence);

    // Add additional evidence based on company details
    if (company.involvement) {
      const involvementEvidence: TransformedWhoProfitsEvidence = {
        companyName: this.cleanCompanyName(company.name),
        tagName: 'BDS',
        bdsCategory,
        strength: 'MEDIUM',
        notes: `Specific Involvement: ${company.involvement}`,
        sourceUrl: company.sourceUrl,
        sourceDomain,
        sourceTitle
      };
      evidence.push(involvementEvidence);
    }

    return evidence;
  }

  private determineEvidenceStrength(company: WhoProfitsCompany): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Determine evidence strength based on available information
    if (company.description && company.description.length > 100) {
      return 'HIGH';
    } else if (company.involvement || company.category) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  private mapInvolvementToBdsCategory(involvement?: string): BdsCategory | undefined {
    if (!involvement) return undefined;

    const involvementLower = involvement.toLowerCase();
    
    if (involvementLower.includes('economic exploitation') || involvementLower.includes('exploitation')) {
      return 'economic_exploitation';
    }
    
    if (involvementLower.includes('occupied production') || involvementLower.includes('occupied resources')) {
      return 'exploitation_occupied_resources';
    }
    
    if (involvementLower.includes('settlement enterprise') || involvementLower.includes('settlement')) {
      return 'settlement_enterprise';
    }
    
    if (involvementLower.includes('israeli construction') || involvementLower.includes('construction on occupied land')) {
      return 'israeli_construction_occupied_land';
    }
    
    if (involvementLower.includes('services to settlements') || involvementLower.includes('settlement services')) {
      return 'services_to_settlements';
    }
    
    // Default category for other BDS activities
    return 'other_bds_activities';
  }

  private createEvidenceNotes(company: WhoProfitsCompany): string {
    let notes = 'BDS-related activities identified by Who Profits research';
    
    if (company.description) {
      notes += `. ${company.description}`;
    }
    
    if (company.involvement) {
      const category = this.mapInvolvementToBdsCategory(company.involvement);
      const categoryLabel = this.getCategoryLabel(category);
      notes += ` Category: ${categoryLabel} (${company.involvement})`;
    }
    
    if (company.category) {
      notes += ` Who Profits Category: ${company.category}`;
    }

    return notes;
  }

  private getCategoryLabel(category?: BdsCategory): string {
    switch (category) {
      case 'economic_exploitation':
        return 'Economic Exploitation';
      case 'exploitation_occupied_resources':
        return 'Exploitation of Occupied Production and Resources';
      case 'settlement_enterprise':
        return 'Settlement Enterprise';
      case 'israeli_construction_occupied_land':
        return 'Israeli Construction on Occupied Land';
      case 'services_to_settlements':
        return 'Services to the Settlements';
      case 'other_bds_activities':
        return 'Other BDS Activities';
      default:
        return 'BDS Activities';
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'whoprofits.org';
    }
  }
}

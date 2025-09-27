import { PrismaClient } from '@prisma/client';
import { ScreeningResult, FilterConfig, BdsCategory, BdsStatus } from '../types/api';
import { CompanyImporter } from './company-importer';

export class EnhancedScreeningEngine {
  private prisma: PrismaClient;
  private companyImporter: CompanyImporter;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.companyImporter = new CompanyImporter();
  }

  async screenCompanies(
    symbols: string[],
    filters: FilterConfig,
    options: { lookthrough: boolean; maxDepth: number; autoDiscover: boolean } = { 
      lookthrough: true, 
      maxDepth: 2, 
      autoDiscover: true 
    }
  ): Promise<ScreeningResult[]> {
    const results: ScreeningResult[] = [];

    try {
      for (const symbol of symbols) {
        console.log(`Processing symbol: ${symbol}`);
        
        let company = await this.resolveCompany(symbol);
        
        // Auto-discovery: If company not found and auto-discovery is enabled
        if (!company && options.autoDiscover) {
          console.log(`🔍 Company not found, attempting auto-discovery: ${symbol}`);
          company = await this.autoDiscoverAndAddCompany(symbol);
        }
        
        if (!company) {
          console.log(`❌ Company not found for symbol: ${symbol}`);
          // Add a "not found" result instead of skipping
          results.push({
            symbol,
            company: `Unknown Company (${symbol})`,
            statuses: {
              bds: { overall: 'pass' as const, categories: [] },
              defense: 'pass' as const,
              surveillance: 'pass' as const,
              shariah: 'pass' as const
            },
            finalVerdict: 'PASS',
            confidence: 'Low',
            reasons: [`Company ${symbol} not found in database`],
            asOfRow: new Date().toISOString(),
            sources: [],
            auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
          continue;
        }

        console.log(`✅ Found company: ${company.name} (${company.ticker})`);
        const result = await this.screenCompany(company, filters);
        results.push(result);
      }
    } catch (error) {
      console.error('Error in screenCompanies:', error);
      throw error;
    }

    // Handle ETF lookthrough if enabled
    if (options.lookthrough) {
      const etfResults = await this.handleETFLookthrough(symbols, filters, options.maxDepth);
      results.push(...etfResults);
    }

    return results;
  }

  private async resolveCompany(symbol: string) {
    try {
      console.log(`Looking up company for symbol: ${symbol}`);
      
      const company = await this.prisma.company.findFirst({
        where: {
          OR: [
            { ticker: symbol.toUpperCase() },
            { alias: { some: { name: symbol.toUpperCase(), type: 'TICKER' } } },
          ],
          active: true,
        },
        include: {
          evidence: {
            include: {
              tag: true,
              source: true,
            },
          },
          contracts: {
            where: {
              period_end: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365) }, // Last 24 months
            },
          },
          arms_rank: {
            where: { year: new Date().getFullYear() },
          },
          financials: {
            orderBy: { period: 'desc' },
            take: 1,
          },
        },
      });
      
      console.log(`Company lookup result:`, company ? `${company.name} (${company.ticker})` : 'Not found');
      return company;
    } catch (error) {
      console.error(`Error looking up company for symbol ${symbol}:`, error);
      throw error;
    }
  }

  private async autoDiscoverAndAddCompany(symbol: string) {
    try {
      console.log(`🚀 Auto-discovering company: ${symbol}`);
      
      // Use the company importer to discover the company
      const discoveredCompany = await this.companyImporter.autoDiscoverCompany(symbol);
      
      if (discoveredCompany) {
        console.log(`✅ Discovered: ${discoveredCompany.name} (${discoveredCompany.ticker})`);
        
        // Add the discovered company to the database
        const added = await this.companyImporter.addDiscoveredCompany(discoveredCompany);
        
        if (added) {
          console.log(`📝 Successfully added to database: ${discoveredCompany.name}`);
          
          // Now fetch the newly added company with all its data
          const newCompany = await this.prisma.company.findFirst({
            where: { ticker: discoveredCompany.ticker },
            include: {
              evidence: {
                include: {
                  tag: true,
                  source: true,
                },
              },
              contracts: {
                where: {
                  period_end: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365) },
                },
              },
              arms_rank: {
                where: { year: new Date().getFullYear() },
              },
              financials: {
                orderBy: { period: 'desc' },
                take: 1,
              },
            },
          });
          
          return newCompany;
        } else {
          console.log(`❌ Failed to add company to database: ${discoveredCompany.name}`);
        }
      } else {
        console.log(`❌ Could not discover company: ${symbol}`);
      }
      
      return null;
    } catch (error) {
      console.error(`Error in auto-discovery for ${symbol}:`, error);
      return null;
    }
  }

  private async screenCompany(company: any, filters: FilterConfig): Promise<ScreeningResult> {
    const statuses: {
      bds: BdsStatus;
      defense: 'pass' | 'review' | 'excluded';
      surveillance: 'pass' | 'review' | 'excluded';
      shariah: 'pass' | 'review' | 'excluded';
    } = {
      bds: { overall: 'pass', categories: [] },
      defense: 'pass',
      surveillance: 'pass',
      shariah: 'pass',
    };

    const reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'High';

            // BDS Screening
        let bdsResult: any = null;
        if (filters.bds) {
          bdsResult = this.screenBDS(company, filters.bds);
          statuses.bds = {
            overall: bdsResult.status as 'pass' | 'review' | 'excluded',
            categories: bdsResult.categories?.map((cat: any) => ({
              category: cat.category as BdsCategory,
              status: cat.status as 'pass' | 'review' | 'excluded',
              evidence: cat.evidence
            }))
          };
          if (bdsResult.reasons.length > 0) {
            reasons.push(...bdsResult.reasons);
          }
          if (bdsResult.confidence === 'Low') confidence = 'Low';
        }

    // Defense Screening
    if (filters.defense) {
      const defenseResult = this.screenDefense(company);
      statuses.defense = defenseResult.status;
      if (defenseResult.reasons.length > 0) {
        reasons.push(...defenseResult.reasons);
      }
      if (defenseResult.confidence === 'Low') confidence = 'Low';
    }

    // Surveillance Screening
    if (filters.surveillance) {
      const surveillanceResult = this.screenSurveillance(company);
      statuses.surveillance = surveillanceResult.status;
      if (surveillanceResult.reasons.length > 0) {
        reasons.push(...surveillanceResult.reasons);
      }
      if (surveillanceResult.confidence === 'Low') confidence = 'Low';
    }

    // Shariah Screening
    if (filters.shariah) {
      const shariahResult = this.screenShariah(company);
      statuses.shariah = shariahResult.status;
      if (shariahResult.reasons.length > 0) {
        reasons.push(...shariahResult.reasons);
      }
      if (shariahResult.confidence === 'Low') confidence = 'Low';
    }

    // Determine final verdict
    const finalVerdict = this.combineVerdicts(statuses);

    // Generate sources
    const sources = await this.generateSources(company);

    return {
      symbol: company.ticker || 'Unknown',
      company: company.name || 'Unknown Company',
      statuses: {
        bds: statuses.bds,
        defense: statuses.defense,
        surveillance: statuses.surveillance,
        shariah: statuses.shariah
      },
      finalVerdict: finalVerdict,
      reasons,
      confidence,
      asOfRow: new Date().toISOString(),
      sources: sources,
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Enhanced BDS Screening with Category-Based Filtering
  private screenBDS(company: any, filters?: any): { 
    status: 'pass' | 'review' | 'excluded'; 
    reasons: string[]; 
    confidence: 'High' | 'Medium' | 'Low';
    categories?: Array<{
      category: string;
      status: 'pass' | 'review' | 'excluded';
      evidence: string[];
      score: number;
    }>;
  } {
    const reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'High';
    const categories: Array<{
      category: string;
      status: 'pass' | 'review' | 'excluded';
      evidence: string[];
      score: number;
    }> = [];

    // Get all BDS evidence
    const bdsEvidence = company.evidence.filter((e: any) => e.tag.name === 'BDS');
    
    if (bdsEvidence.length === 0) {
      return { 
        status: 'pass', 
        reasons: [], 
        confidence: 'High',
        categories: []
      };
    }

    // Group evidence by BDS category
    const evidenceByCategory = this.groupBDSEvidenceByCategory(bdsEvidence);
    
    // Calculate category scores and statuses
    let overallScore = 0;
    let totalEvidence = 0;
    let hasExcludedCategory = false;
    let hasReviewCategory = false;

    for (const [category, evidence] of Object.entries(evidenceByCategory)) {
      // Skip categories if specific filtering is requested
      if (filters?.bds?.categories && 
          filters.bds.categories.length > 0 && 
          !filters.bds.categories.includes(category)) {
        continue;
      }

      const categoryResult = this.evaluateBDSCategory(category, evidence);
      categories.push(categoryResult);
      
      // Aggregate overall scoring
      overallScore += categoryResult.score;
      totalEvidence += evidence.length;
      
      if (categoryResult.status === 'excluded') {
        hasExcludedCategory = true;
        reasons.push(`[${category}] ${categoryResult.evidence.join('; ')}`);
      } else if (categoryResult.status === 'review') {
        hasReviewCategory = true;
        reasons.push(`[${category}] ${categoryResult.evidence.join('; ')}`);
      }
    }

    // Determine overall status
    let status: 'pass' | 'review' | 'excluded' = 'pass';
    if (hasExcludedCategory) {
      status = 'excluded';
    } else if (hasReviewCategory || overallScore > 0) {
      status = 'review';
    }

    // Enhanced confidence calculation
    confidence = this.calculateBDSConfidence(bdsEvidence, categories, overallScore, totalEvidence);

    return {
      status,
      reasons,
      confidence,
      categories
    };
  }

  private groupBDSEvidenceByCategory(evidence: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    for (const item of evidence) {
      const category = item.bdsCategory || 'other_bds_activities';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    }
    
    return grouped;
  }

  private evaluateBDSCategory(category: string, evidence: any[]): {
    category: string;
    status: 'pass' | 'review' | 'excluded';
    evidence: string[];
    score: number;
  } {
    if (evidence.length === 0) {
      return {
        category,
        status: 'pass',
        evidence: [],
        score: 0
      };
    }

    // Calculate category-specific score
    let score = 0;
    const evidenceTexts: string[] = [];
    
    for (const item of evidence) {
      const evidenceScore = this.calculateEvidenceScore(item);
      score += evidenceScore;
      
      // Format evidence text
      const evidenceText = this.formatEvidenceText(item);
      evidenceTexts.push(evidenceText);
    }

    // Apply category-specific thresholds
    const status = this.determineCategoryStatus(category, score, evidence.length);
    
    return {
      category,
      status,
      evidence: evidenceTexts,
      score
    };
  }

  private calculateEvidenceScore(evidence: any): number {
    let score = 0;
    
    // Base score by strength
    switch (evidence.strength) {
      case 'HIGH':
        score += 10;
        break;
      case 'MEDIUM':
        score += 6;
        break;
      case 'LOW':
        score += 2;
        break;
    }

    // Bonus for recent evidence (within last 2 years)
    const evidenceAge = Date.now() - new Date(evidence.observedAt).getTime();
    const twoYearsAgo = 2 * 365 * 24 * 60 * 60 * 1000;
    if (evidenceAge < twoYearsAgo) {
      score += 2;
    }

    // Bonus for multiple sources (if we had source reliability data)
    // This could be enhanced with source credibility scoring
    
    return score;
  }

  private determineCategoryStatus(category: string, score: number, evidenceCount: number): 'pass' | 'review' | 'excluded' {
    // Category-specific thresholds based on research methodology
    const thresholds = {
      'settlement_enterprise': { exclude: 8, review: 4 },
      'israeli_construction_occupied_land': { exclude: 8, review: 4 },
      'economic_exploitation': { exclude: 6, review: 3 },
      'exploitation_occupied_resources': { exclude: 6, review: 3 },
      'services_to_settlements': { exclude: 5, review: 2 },
      'other_bds_activities': { exclude: 7, review: 3 }
    };

    const threshold = thresholds[category as keyof typeof thresholds] || thresholds.other_bds_activities;
    
    if (score >= threshold.exclude) {
      return 'excluded';
    } else if (score >= threshold.review || evidenceCount >= 3) {
      return 'review';
    }
    
    return 'pass';
  }

  private calculateBDSConfidence(
    evidence: any[], 
    categories: any[], 
    overallScore: number, 
    totalEvidence: number
  ): 'High' | 'Medium' | 'Low' {
    // Base confidence on evidence quality and quantity
    let confidenceScore = 0;
    
    // Evidence strength distribution
    const highStrengthCount = evidence.filter(e => e.strength === 'HIGH').length;
    const mediumStrengthCount = evidence.filter(e => e.strength === 'MEDIUM').length;
    
    confidenceScore += highStrengthCount * 3;
    confidenceScore += mediumStrengthCount * 2;
    confidenceScore += evidence.length; // Quantity bonus
    
    // Category coverage bonus
    const activeCategories = categories.filter(c => c.status !== 'pass').length;
    confidenceScore += activeCategories * 2;
    
    // Score-based confidence
    if (overallScore > 15) confidenceScore += 5;
    else if (overallScore > 8) confidenceScore += 3;
    else if (overallScore > 0) confidenceScore += 1;
    
    // Determine confidence level
    if (confidenceScore >= 15) return 'High';
    else if (confidenceScore >= 8) return 'Medium';
    else return 'Low';
  }

  private formatEvidenceText(evidence: any): string {
    let text = evidence.notes || 'BDS activity detected';
    
    // Add strength indicator
    const strengthText = evidence.strength === 'HIGH' ? '[High]' : 
                        evidence.strength === 'MEDIUM' ? '[Medium]' : '[Low]';
    
    // Add date if available
    if (evidence.observedAt) {
      const date = new Date(evidence.observedAt).toLocaleDateString();
      text = `${strengthText} ${text} (${date})`;
    } else {
      text = `${strengthText} ${text}`;
    }
    
    return text;
  }

  private screenDefense(company: any): { status: 'pass' | 'review' | 'excluded'; reasons: string[]; confidence: 'High' | 'Medium' | 'Low' } {
    const reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'High';

    if (!company.contracts || company.contracts.length === 0) {
      return { status: 'pass', reasons: [], confidence: 'High' };
    }

    const majorContracts = company.contracts.filter((c: any) => c.amount > 10000000); // > $10M
    const minorContracts = company.contracts.filter((c: any) => c.amount <= 10000000 && c.amount > 1000000); // $1M-$10M

    if (majorContracts.length > 0) {
      const contractDetails = majorContracts.map((c: any) => 
        `${c.agency} contract: $${(c.amount / 1000000).toFixed(1)}M`
      );
      reasons.push(...contractDetails);
      return { status: 'excluded', reasons, confidence: 'High' };
    }

    if (minorContracts.length > 0) {
      const contractDetails = minorContracts.map((c: any) => 
        `${c.agency} contract: $${(c.amount / 1000000).toFixed(1)}M`
      );
      reasons.push(...contractDetails);
      confidence = 'Medium';
      return { status: 'review', reasons, confidence };
    }

    return { status: 'pass', reasons: [], confidence: 'High' };
  }

  private screenSurveillance(company: any): { status: 'pass' | 'review' | 'excluded'; reasons: string[]; confidence: 'High' | 'Medium' | 'Low' } {
    const reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'High';

    const surveillanceEvidence = company.evidence.filter((e: any) => e.tag.name === 'Surveillance');

    if (surveillanceEvidence.length === 0) {
      return { status: 'pass', reasons: [], confidence: 'High' };
    }

    const invasiveEvidence = surveillanceEvidence.filter((e: any) => e.strength === 'HIGH');
    const otherEvidence = surveillanceEvidence.filter((e: any) => e.strength === 'MEDIUM' || e.strength === 'LOW');

    if (invasiveEvidence.length > 0) {
      reasons.push(...invasiveEvidence.map((e: any) => e.notes));
      return { status: 'excluded', reasons, confidence: 'High' };
    }

    if (otherEvidence.length > 0) {
      reasons.push(...otherEvidence.map((e: any) => e.notes));
      confidence = 'Medium';
      return { status: 'review', reasons, confidence };
    }

    return { status: 'pass', reasons: [], confidence: 'High' };
  }

  private screenShariah(company: any): { status: 'pass' | 'review' | 'excluded'; reasons: string[]; confidence: 'High' | 'Medium' | 'Low' } {
    const reasons: string[] = [];
    let confidence: 'High' | 'Medium' | 'Low' = 'High';

    const shariahEvidence = company.evidence.filter((e: any) => e.tag.name === 'Shariah');

    if (shariahEvidence.length === 0) {
      return { status: 'pass', reasons: [], confidence: 'High' };
    }

    const highStrengthEvidence = shariahEvidence.filter((e: any) => e.strength === 'HIGH');
    const mediumStrengthEvidence = shariahEvidence.filter((e: any) => e.strength === 'MEDIUM');
    const lowStrengthEvidence = shariahEvidence.filter((e: any) => e.strength === 'LOW');

    if (highStrengthEvidence.length > 0) {
      reasons.push(...highStrengthEvidence.map((e: any) => e.notes));
      return { status: 'excluded', reasons, confidence: 'High' };
    }

    if (mediumStrengthEvidence.length > 0) {
      reasons.push(...mediumStrengthEvidence.map((e: any) => e.notes));
      confidence = 'Medium';
      return { status: 'review', reasons, confidence };
    }

    if (lowStrengthEvidence.length > 0) {
      reasons.push(...lowStrengthEvidence.map((e: any) => e.notes));
      confidence = 'Low';
      return { status: 'review', reasons, confidence };
    }

    return { status: 'pass', reasons: [], confidence: 'High' };
  }

  private combineVerdicts(statuses: any): 'PASS' | 'REVIEW' | 'EXCLUDED' {
    if (statuses.bds === 'excluded' || statuses.defense === 'excluded' || 
        statuses.surveillance === 'excluded' || statuses.shariah === 'excluded') {
      return 'EXCLUDED';
    }
    
    if (statuses.bds === 'review' || statuses.defense === 'review' || 
        statuses.surveillance === 'review' || statuses.shariah === 'review') {
      return 'REVIEW';
    }
    
    return 'PASS';
  }

  private async generateSources(company: any): Promise<Array<{ label: string; url: string }>> {
    const sources: Array<{ label: string; url: string }> = [];

    try {
      // Add contract sources
      if (company.contracts && company.contracts.length > 0) {
        for (const contract of company.contracts) {
          if (contract.source && contract.source.url) {
            sources.push({
              label: `DoD Contract - ${contract.agency || 'Unknown Agency'}`,
              url: contract.source.url
            });
          }
        }
      }

      // Add arms ranking sources
      if (company.arms_rank && company.arms_rank.length > 0) {
        for (const rank of company.arms_rank) {
          if (rank.source && rank.source.url) {
            sources.push({
              label: `SIPRI Arms Ranking - ${rank.year || 'Unknown Year'}`,
              url: rank.source.url
            });
          }
        }
      }

      // Add evidence sources
      if (company.evidence && company.evidence.length > 0) {
        for (const evidence of company.evidence) {
          if (evidence.source && evidence.source.url) {
            // Create meaningful labels based on evidence type and source
            let label = 'Evidence';
            if (evidence.tag && evidence.tag.name) {
              label = `${evidence.tag.name} Evidence`;
              if (evidence.tag.subtype) {
                label += ` - ${evidence.tag.subtype}`;
              }
            }
            
            // Add source information to make it more specific
            if (evidence.source.domain) {
              label += ` from ${evidence.source.domain}`;
            } else if (evidence.source.title) {
              label += ` from ${evidence.source.title}`;
            } else if (evidence.source.publisher) {
              label += ` from ${evidence.source.publisher}`;
            }
            
            sources.push({
              label,
              url: evidence.source.url
            });
          }
        }
      }

      // Remove duplicates based on URL
      const uniqueSources = new Map<string, { label: string; url: string }>();
      sources.forEach(source => {
        if (!uniqueSources.has(source.url)) {
          uniqueSources.set(source.url, source);
        }
      });

      return Array.from(uniqueSources.values());
    } catch (error) {
      console.error('Error generating sources:', error);
      return [];
    }
  }

  private async handleETFLookthrough(symbols: string[], filters: FilterConfig, maxDepth: number): Promise<ScreeningResult[]> {
    // Placeholder for ETF lookthrough logic
    return [];
  }

  async disconnect(): Promise<void> {
    await this.companyImporter.disconnect();
  }
}

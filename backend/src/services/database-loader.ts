import { PrismaClient } from '@prisma/client';
import { TransformedCompany, TransformedEvidence, TransformedSource } from './data-transformer';
import { TransformedWhoProfitsCompany, TransformedWhoProfitsEvidence } from './data-transformer-whoprofits';

export interface LoadResult {
  companiesCreated: number;
  companiesUpdated: number;
  evidenceCreated: number;
  sourcesCreated: number;
  errors: string[];
}

export class DatabaseLoader {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Load transformed BDS data into the database
   */
  async loadBDSData(
    companies: TransformedCompany[],
    sources: TransformedSource[],
    companyEvidenceMap: Map<string, TransformedEvidence[]>
  ): Promise<LoadResult> {
    console.log('💾 Loading BDS data into database...');
    
    const result: LoadResult = {
      companiesCreated: 0,
      companiesUpdated: 0,
      evidenceCreated: 0,
      sourcesCreated: 0,
      errors: [],
    };

    try {
      // Step 1: Load sources
      console.log('📚 Loading sources...');
      const sourceMap = await this.loadSources(sources);
      result.sourcesCreated = sourceMap.size;

      // Step 2: Load companies
      console.log('🏢 Loading companies...');
      const companyResults = await this.loadCompanies(companies);
      result.companiesCreated = companyResults.created;
      result.companiesUpdated = companyResults.updated;

      // Step 3: Load evidence
      console.log('🔍 Loading evidence...');
      const evidenceResults = await this.loadEvidenceByCompany(companyEvidenceMap, sourceMap);
      result.evidenceCreated = evidenceResults.created;

      console.log('✅ Database loading complete!');
      console.log(`   Sources: ${result.sourcesCreated}`);
      console.log(`   Companies: ${result.companiesCreated} created, ${result.companiesUpdated} updated`);
      console.log(`   Evidence: ${result.evidenceCreated} created`);

    } catch (error) {
      console.error('❌ Error loading data:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Load sources into database
   */
  private async loadSources(sources: TransformedSource[]): Promise<Map<string, string>> {
    const sourceMap = new Map<string, string>();

    for (const source of sources) {
      try {
        const existingSource = await this.prisma.source.findFirst({
          where: { domain: source.domain }
        });

        if (existingSource) {
          sourceMap.set(source.domain, existingSource.id);
          console.log(`   Source exists: ${source.title}`);
        } else {
          const newSource = await this.prisma.source.create({
            data: {
              domain: source.domain,
              title: source.title,
              url: source.url,
              publisher: source.publisher,
            }
          });
          sourceMap.set(source.domain, newSource.id);
          console.log(`   Source created: ${source.title}`);
        }
      } catch (error) {
        console.error(`   Error loading source ${source.title}:`, error);
      }
    }

    return sourceMap;
  }

  /**
   * Load companies into database
   */
  private async loadCompanies(companies: TransformedCompany[]): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const company of companies) {
      try {
        // Check if company exists by name
        const existingCompany = await this.prisma.company.findFirst({
          where: { name: company.name }
        });

        if (existingCompany) {
          // Update existing company
          await this.prisma.company.update({
            where: { id: existingCompany.id },
            data: {
              country: company.country || existingCompany.country,
              lastUpdated: new Date(),
            }
          });
          updated++;
          console.log(`   Company updated: ${company.name}`);
        } else {
          // Create new company
          await this.prisma.company.create({
            data: {
              name: company.name,
              ticker: company.ticker || null,
              country: company.country || null,
              cik: company.cik || null,
              isin: company.isin || null,
              figi: company.figi || null,
            }
          });
          created++;
          console.log(`   Company created: ${company.name}`);
        }
      } catch (error) {
        console.error(`   Error loading company ${company.name}:`, error);
      }
    }

    return { created, updated };
  }

  /**
   * Load evidence into database using company evidence map
   */
  private async loadEvidenceByCompany(
    companyEvidenceMap: Map<string, TransformedEvidence[]>,
    sourceMap: Map<string, string>
  ): Promise<{ created: number }> {
    let created = 0;

    // Get source ID (use the first/main source)
    const sourceId = sourceMap.values().next().value;
    if (!sourceId) {
      console.log(`   No sources available for evidence creation`);
      return { created: 0 };
    }

    for (const [companyName, evidenceList] of companyEvidenceMap) {
      try {
        // Find the company by exact name match
        const company = await this.prisma.company.findFirst({
          where: { name: companyName }
        });

        if (!company) {
          console.log(`   Skipping evidence - company not found: ${companyName}`);
          continue;
        }

        // Create evidence for this company
        for (const evidenceItem of evidenceList) {
          try {
            // Find or create the tag
            const tag = await this.findOrCreateTag(evidenceItem.tagName);

            // Create evidence
            await this.prisma.evidence.create({
              data: {
                companyId: company.id,
                tagId: tag.id,
                sourceId: sourceId,
                strength: evidenceItem.strength,
                notes: evidenceItem.notes,
                bdsCategory: evidenceItem.bdsCategory || null,
              }
            });

            created++;
            console.log(`   Evidence created for ${company.name}: ${evidenceItem.tagName}`);
          } catch (error) {
            console.error(`   Error creating evidence for ${company.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`   Error processing company ${companyName}:`, error);
      }
    }

    return { created };
  }

  /**
   * Load evidence into database (OLD METHOD - DEPRECATED)
   */
  private async loadEvidence(
    evidence: TransformedEvidence[],
    sourceMap: Map<string, string>
  ): Promise<{ created: number }> {
    let created = 0;

    for (const evidenceItem of evidence) {
      try {
        // Find the company by the company name stored in the evidence
        const company = await this.prisma.company.findFirst({
          where: { name: evidenceItem.companyName }
        });

        if (!company) {
          console.log(`   Skipping evidence - company not found: ${evidenceItem.notes.substring(0, 50)}...`);
          continue;
        }

        // Find or create the tag
        const tag = await this.findOrCreateTag(evidenceItem.tagName);

        // Get source ID (default to first source if not found)
        const sourceId = sourceMap.values().next().value;
        
        if (!sourceId) {
          console.log(`   Skipping evidence - no source found for ${company.name}`);
          continue;
        }

        // Create evidence
        await this.prisma.evidence.create({
          data: {
            companyId: company.id,
            tagId: tag.id,
            sourceId: sourceId,
            strength: evidenceItem.strength,
            notes: evidenceItem.notes,
          }
        });

        created++;
        console.log(`   Evidence created for ${company.name}: ${evidenceItem.tagName}`);
      } catch (error) {
        console.error(`   Error loading evidence:`, error);
      }
    }

    return { created };
  }

  /**
   * Find or create a tag
   */
  private async findOrCreateTag(tagName: string) {
    let tag = await this.prisma.tag.findFirst({
      where: { name: tagName as any }
    });

    if (!tag) {
      tag = await this.prisma.tag.create({
        data: {
          name: tagName as any,
          description: `Automatically created from BDS data import`,
        }
      });
      console.log(`   Tag created: ${tagName}`);
    }

    return tag;
  }

  /**
   * Load Who Profits sources into database
   */
  async loadWhoProfitsSources(evidence: TransformedWhoProfitsEvidence[]): Promise<{ added: number; existing: number }> {
    let added = 0;
    let existing = 0;
    const processedDomains = new Set<string>();

    for (const evidenceItem of evidence) {
      if (processedDomains.has(evidenceItem.sourceDomain)) {
        continue; // Skip duplicates
      }
      processedDomains.add(evidenceItem.sourceDomain);

      try {
        const existingSource = await this.prisma.source.findFirst({
          where: { domain: evidenceItem.sourceDomain }
        });

        if (existingSource) {
          existing++;
        } else {
          await this.prisma.source.create({
            data: {
              domain: evidenceItem.sourceDomain,
              title: evidenceItem.sourceTitle,
              url: evidenceItem.sourceUrl,
              publisher: 'Who Profits',
            }
          });
          added++;
          console.log(`   Source created: ${evidenceItem.sourceTitle}`);
        }
      } catch (error) {
        console.error(`   Error loading source ${evidenceItem.sourceDomain}:`, error);
      }
    }

    return { added, existing };
  }

  /**
   * Load Who Profits companies into database
   */
  async loadWhoProfitsCompanies(companies: TransformedWhoProfitsCompany[]): Promise<{ added: number; existing: number }> {
    let added = 0;
    let existing = 0;

    for (const company of companies) {
      try {
        const existingCompany = await this.prisma.company.findFirst({
          where: { name: company.name }
        });

        if (existingCompany) {
          existing++;
          console.log(`   Company exists: ${company.name}`);
        } else {
          await this.prisma.company.create({
            data: {
              name: company.name,
              ticker: company.ticker || null,
              country: company.country || null,
              cik: null,
              isin: null,
              figi: null,
            }
          });
          added++;
          console.log(`   Company created: ${company.name}`);
        }
      } catch (error) {
        console.error(`   Error loading company ${company.name}:`, error);
      }
    }

    return { added, existing };
  }

  /**
   * Load Who Profits evidence into database
   */
  async loadWhoProfitsEvidence(companyEvidenceMap: Map<string, TransformedWhoProfitsEvidence[]>): Promise<{ added: number; existing: number }> {
    let added = 0;
    let existing = 0;

    for (const [companyName, evidenceList] of companyEvidenceMap) {
      try {
        // Find the company
        const company = await this.prisma.company.findFirst({
          where: { name: companyName }
        });

        if (!company) {
          console.log(`   Skipping evidence - company not found: ${companyName}`);
          continue;
        }

        // Create evidence for this company
        for (const evidenceItem of evidenceList) {
          try {
            // Find the source
            const source = await this.prisma.source.findFirst({
              where: { domain: evidenceItem.sourceDomain }
            });

            if (!source) {
              console.log(`   Skipping evidence - source not found: ${evidenceItem.sourceDomain}`);
              continue;
            }

            // Find or create the tag
            const tag = await this.findOrCreateTag(evidenceItem.tagName);

            // Check if evidence already exists
            const existingEvidence = await this.prisma.evidence.findFirst({
              where: {
                companyId: company.id,
                tagId: tag.id,
                sourceId: source.id,
                notes: evidenceItem.notes
              }
            });

            if (existingEvidence) {
              existing++;
            } else {
              // Create evidence
              await this.prisma.evidence.create({
                data: {
                  companyId: company.id,
                  tagId: tag.id,
                  sourceId: source.id,
                  strength: evidenceItem.strength,
                  notes: evidenceItem.notes,
                }
              });
              added++;
              console.log(`   Evidence created for ${company.name}: ${evidenceItem.tagName}`);
            }
          } catch (error) {
            console.error(`   Error creating evidence for ${company.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`   Error processing company ${companyName}:`, error);
      }
    }

    return { added, existing };
  }

  /**
   * Close database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

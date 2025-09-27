import { AFSCScraper } from './scrapers/afsc-scraper';
import { WhoProfitsScraper } from './scrapers/whoprofits-scraper';
import { PACBIAcademicScraper } from './scrapers/pacbi-academic-scraper';
import { TradeUnionBDSScraper } from './scrapers/trade-union-bds-scraper';
import { UNDatabaseScraper } from './scrapers/un-database-scraper';
import { UnifiedBDSDataTransformer } from './data-transformer-unified';
import { DatabaseLoader } from './database-loader';

export interface EnhancedBDSPipelineResult {
  totalCompaniesScraped: number;
  totalCompaniesTransformed: number;
  totalEvidence: number;
  sourcesUsed: string[];
  companiesAdded: number;
  companiesUpdated: number;
  evidenceAdded: number;
  errors: string[];
  processingTime: number;
  completedAt: Date;
}

export class EnhancedBDSPipelineV2 {
  private afscScraper: AFSCScraper;
  private whoProfitsScraper: WhoProfitsScraper;
  private pacbiScraper: PACBIAcademicScraper;
  private tradeUnionScraper: TradeUnionBDSScraper;
  private unDatabaseScraper: UNDatabaseScraper;
  private transformer: UnifiedBDSDataTransformer;
  private databaseLoader: DatabaseLoader;

  constructor() {
    this.afscScraper = new AFSCScraper();
    this.whoProfitsScraper = new WhoProfitsScraper();
    this.pacbiScraper = new PACBIAcademicScraper();
    this.tradeUnionScraper = new TradeUnionBDSScraper();
    this.unDatabaseScraper = new UNDatabaseScraper();
    this.transformer = new UnifiedBDSDataTransformer();
    this.databaseLoader = new DatabaseLoader();
  }

  async runFullPipeline(): Promise<EnhancedBDSPipelineResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const sourcesUsed: string[] = [];

    try {
      console.log('🚀 Starting Enhanced BDS Pipeline V2...');
      console.log('==========================================\n');

      // Step 1: Scrape all data sources in parallel
      console.log('📡 Phase 1: Scraping all BDS data sources...');
      const [
        afscResult,
        whoProfitsResult,
        pacbiResult,
        tradeUnionResult,
        unDatabaseResult
      ] = await Promise.allSettled([
        this.afscScraper.scrapeCompanies(5),
        this.whoProfitsScraper.scrapeCompanies(5),
        this.pacbiScraper.scrapeInstitutions(5),
        this.tradeUnionScraper.scrapeCompanies(5),
        this.unDatabaseScraper.scrapeCompanies(5)
      ]);

      // Process results and track sources
      let totalCompaniesScraped = 0;
      
      if (afscResult.status === 'fulfilled') {
        totalCompaniesScraped += afscResult.value.companies.length;
        sourcesUsed.push('AFSC Investigate');
        console.log(`✅ AFSC: ${afscResult.value.companies.length} companies`);
      } else {
        errors.push(`AFSC scraping failed: ${afscResult.reason}`);
        console.log(`❌ AFSC: Failed`);
      }

      if (whoProfitsResult.status === 'fulfilled') {
        totalCompaniesScraped += whoProfitsResult.value.companies.length;
        sourcesUsed.push('Who Profits');
        console.log(`✅ Who Profits: ${whoProfitsResult.value.companies.length} companies`);
      } else {
        errors.push(`Who Profits scraping failed: ${whoProfitsResult.reason}`);
        console.log(`❌ Who Profits: Failed`);
      }

      if (pacbiResult.status === 'fulfilled') {
        totalCompaniesScraped += pacbiResult.value.institutions.length;
        sourcesUsed.push('PACBI Academic Boycotts');
        console.log(`✅ PACBI Academic: ${pacbiResult.value.institutions.length} institutions`);
      } else {
        errors.push(`PACBI Academic scraping failed: ${pacbiResult.reason}`);
        console.log(`❌ PACBI Academic: Failed`);
      }

      if (tradeUnionResult.status === 'fulfilled') {
        totalCompaniesScraped += tradeUnionResult.value.companies.length;
        sourcesUsed.push('Trade Union BDS Campaigns');
        console.log(`✅ Trade Union BDS: ${tradeUnionResult.value.companies.length} companies`);
      } else {
        errors.push(`Trade Union BDS scraping failed: ${tradeUnionResult.reason}`);
        console.log(`❌ Trade Union BDS: Failed`);
      }

      if (unDatabaseResult.status === 'fulfilled') {
        totalCompaniesScraped += unDatabaseResult.value.companies.length;
        sourcesUsed.push('UN Database Settlement Reports');
        console.log(`✅ UN Database: ${unDatabaseResult.value.companies.length} companies`);
      } else {
        errors.push(`UN Database scraping failed: ${unDatabaseResult.reason}`);
        console.log(`❌ UN Database: Failed`);
      }

      console.log(`\n📊 Total companies scraped: ${totalCompaniesScraped}`);
      console.log(`📊 Sources used: ${sourcesUsed.length}\n`);

      // Step 2: Transform all data
      console.log('🔄 Phase 2: Transforming and deduplicating data...');
      const transformationResult = await this.transformer.transformAllSources(
        afscResult.status === 'fulfilled' ? afscResult.value : undefined,
        whoProfitsResult.status === 'fulfilled' ? whoProfitsResult.value : undefined,
        pacbiResult.status === 'fulfilled' ? pacbiResult.value : undefined,
        tradeUnionResult.status === 'fulfilled' ? tradeUnionResult.value : undefined,
        unDatabaseResult.status === 'fulfilled' ? unDatabaseResult.value : undefined
      );

      console.log(`✅ Transformation complete: ${transformationResult.totalCompanies} unique companies, ${transformationResult.totalEvidence} evidence items\n`);

      // Step 3: Load data into database (simplified for now)
      console.log('💾 Phase 3: Database loading (simulated)...');
      const loadResult = {
        companiesAdded: transformationResult.totalCompanies,
        companiesUpdated: 0,
        evidenceAdded: transformationResult.totalEvidence
      };

      console.log(`✅ Database loading complete: ${loadResult.companiesAdded} companies processed, ${loadResult.evidenceAdded} evidence items\n`);

      const processingTime = Date.now() - startTime;

      console.log('🎉 Enhanced BDS Pipeline V2 Complete!');
      console.log('==========================================');
      console.log(`⏱️  Total processing time: ${(processingTime / 1000).toFixed(2)} seconds`);
      console.log(`🏢 Companies processed: ${transformationResult.totalCompanies}`);
      console.log(`📝 Evidence items: ${transformationResult.totalEvidence}`);
      console.log(`🌐 Data sources: ${sourcesUsed.join(', ')}`);

      return {
        totalCompaniesScraped,
        totalCompaniesTransformed: transformationResult.totalCompanies,
        totalEvidence: transformationResult.totalEvidence,
        sourcesUsed,
        companiesAdded: loadResult.companiesAdded,
        companiesUpdated: loadResult.companiesUpdated,
        evidenceAdded: loadResult.evidenceAdded,
        errors,
        processingTime,
        completedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      errors.push(`Pipeline execution failed: ${error}`);
      
      return {
        totalCompaniesScraped: 0,
        totalCompaniesTransformed: 0,
        totalEvidence: 0,
        sourcesUsed: [],
        companiesAdded: 0,
        companiesUpdated: 0,
        evidenceAdded: 0,
        errors,
        processingTime: Date.now() - startTime,
        completedAt: new Date()
      };
    }
  }

  async runSourceSpecificPipeline(source: string): Promise<EnhancedBDSPipelineResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const sourcesUsed: string[] = [];

    try {
      console.log(`🚀 Running source-specific pipeline for: ${source}`);
      console.log('==========================================\n');

      let transformationResult;
      let totalCompaniesScraped = 0;

      switch (source.toLowerCase()) {
        case 'afsc':
          console.log('📡 Scraping AFSC Investigate...');
          const afscResult = await this.afscScraper.scrapeCompanies(5);
          totalCompaniesScraped = afscResult.companies.length;
          sourcesUsed.push('AFSC Investigate');
          
          console.log('🔄 Transforming AFSC data...');
          transformationResult = await this.transformer.transformAllSources(afscResult);
          break;

        case 'whoprofits':
          console.log('📡 Scraping Who Profits...');
          const whoProfitsResult = await this.whoProfitsScraper.scrapeCompanies(5);
          totalCompaniesScraped = whoProfitsResult.companies.length;
          sourcesUsed.push('Who Profits');
          
          console.log('🔄 Transforming Who Profits data...');
          transformationResult = await this.transformer.transformAllSources(undefined, whoProfitsResult);
          break;

        case 'pacbi':
          console.log('📡 Scraping PACBI Academic Boycotts...');
          const pacbiResult = await this.pacbiScraper.scrapeInstitutions(5);
          totalCompaniesScraped = pacbiResult.institutions.length;
          sourcesUsed.push('PACBI Academic Boycotts');
          
          console.log('🔄 Transforming PACBI data...');
          transformationResult = await this.transformer.transformAllSources(undefined, undefined, pacbiResult);
          break;

        case 'tradeunion':
          console.log('📡 Scraping Trade Union BDS Campaigns...');
          const tradeUnionResult = await this.tradeUnionScraper.scrapeCompanies(5);
          totalCompaniesScraped = tradeUnionResult.companies.length;
          sourcesUsed.push('Trade Union BDS Campaigns');
          
          console.log('🔄 Transforming Trade Union data...');
          transformationResult = await this.transformer.transformAllSources(undefined, undefined, undefined, tradeUnionResult);
          break;

        case 'undatabase':
          console.log('📡 Scraping UN Database Settlement Reports...');
          const unDatabaseResult = await this.unDatabaseScraper.scrapeCompanies(5);
          totalCompaniesScraped = unDatabaseResult.companies.length;
          sourcesUsed.push('UN Database Settlement Reports');
          
          console.log('🔄 Transforming UN Database data...');
          transformationResult = await this.transformer.transformAllSources(undefined, undefined, undefined, undefined, unDatabaseResult);
          break;

        default:
          throw new Error(`Unknown source: ${source}`);
      }

      console.log(`✅ Transformation complete: ${transformationResult.totalCompanies} unique companies, ${transformationResult.totalEvidence} evidence items\n`);

      // Load data into database (simplified for now)
      console.log('💾 Loading data into database (simulated)...');
      const loadResult = {
        companiesAdded: transformationResult.totalCompanies,
        companiesUpdated: 0,
        evidenceAdded: transformationResult.totalEvidence
      };

      console.log(`✅ Database loading complete: ${loadResult.companiesAdded} companies processed, ${loadResult.evidenceAdded} evidence items\n`);

      const processingTime = Date.now() - startTime;

      console.log(`🎉 Source-specific pipeline for ${source} complete!`);
      console.log('==========================================');
      console.log(`⏱️  Processing time: ${(processingTime / 1000).toFixed(2)} seconds`);
      console.log(`🏢 Companies processed: ${transformationResult.totalCompanies}`);
      console.log(`📝 Evidence items: ${transformationResult.totalEvidence}`);

      return {
        totalCompaniesScraped,
        totalCompaniesTransformed: transformationResult.totalCompanies,
        totalEvidence: transformationResult.totalEvidence,
        sourcesUsed,
        companiesAdded: loadResult.companiesAdded,
        companiesUpdated: loadResult.companiesUpdated,
        evidenceAdded: loadResult.evidenceAdded,
        errors,
        processingTime,
        completedAt: new Date()
      };

    } catch (error) {
      console.error('❌ Source-specific pipeline failed:', error);
      errors.push(`Source-specific pipeline failed: ${error}`);
      
      return {
        totalCompaniesScraped: 0,
        totalCompaniesTransformed: 0,
        totalEvidence: 0,
        sourcesUsed: [],
        companiesAdded: 0,
        companiesUpdated: 0,
        evidenceAdded: 0,
        errors,
        processingTime: Date.now() - startTime,
        completedAt: new Date()
      };
    }
  }
}

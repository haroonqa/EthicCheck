import { AFSCScraper } from './scrapers/afsc-scraper';
import { WhoProfitsScraper } from './scrapers/whoprofits-scraper';
import { BDSMovementScraper } from './scrapers/bds-movement-scraper';
import { UNDatabaseScraper } from './scrapers/un-database-scraper';
import { DatabaseLoader } from './database-loader';
import { DataTransformer } from './data-transformer';
import { WhoProfitsDataTransformer } from './data-transformer-whoprofits';

export interface EnhancedBDSPipelineResult {
  totalCompanies: number;
  totalEvidence: number;
  sourcesCreated: number;
  companiesCreated: number;
  companiesUpdated: number;
  evidenceCreated: number;
  errors: string[];
  sourceBreakdown: {
    afsc: number;
    whoProfits: number;
    bdsMovement: number;
    unDatabase: number;
  };
}

export class EnhancedBDSPipeline {
  private afscScraper: AFSCScraper;
  private whoProfitsScraper: WhoProfitsScraper;
  private bdsMovementScraper: BDSMovementScraper;
  private unDatabaseScraper: UNDatabaseScraper;
  private databaseLoader: DatabaseLoader;
  private dataTransformer: DataTransformer;
  private whoProfitsTransformer: WhoProfitsDataTransformer;

  constructor() {
    this.afscScraper = new AFSCScraper();
    this.whoProfitsScraper = new WhoProfitsScraper();
    this.bdsMovementScraper = new BDSMovementScraper();
    this.unDatabaseScraper = new UNDatabaseScraper();
    this.databaseLoader = new DatabaseLoader();
    this.dataTransformer = new DataTransformer();
    this.whoProfitsTransformer = new WhoProfitsDataTransformer();
  }

  async runFullPipeline(): Promise<EnhancedBDSPipelineResult> {
    console.log('🚀 Starting Enhanced BDS Data Pipeline...');
    console.log('==========================================');
    
    const result: EnhancedBDSPipelineResult = {
      totalCompanies: 0,
      totalEvidence: 0,
      sourcesCreated: 0,
      companiesCreated: 0,
      companiesUpdated: 0,
      evidenceCreated: 0,
      errors: [],
      sourceBreakdown: {
        afsc: 0,
        whoProfits: 0,
        bdsMovement: 0,
        unDatabase: 0
      }
    };

    try {
      // Step 1: Scrape all data sources
      console.log('\n📡 Step 1: Scraping All Data Sources');
      console.log('=====================================');
      
      const [afscData, whoProfitsData, bdsMovementData, unDatabaseData] = await Promise.all([
        this.scrapeAFSCData(),
        this.scrapeWhoProfitsData(),
        this.scrapeBDSMovementData(),
        this.scrapeUNDatabaseData()
      ]);

      // Update source breakdown
      result.sourceBreakdown.afsc = afscData.companies.length;
      result.sourceBreakdown.whoProfits = whoProfitsData.companies.length;
      result.sourceBreakdown.bdsMovement = bdsMovementData.companies.length;
      result.sourceBreakdown.unDatabase = unDatabaseData.companies.length;

      console.log(`✅ AFSC: ${afscData.companies.length} companies`);
      console.log(`✅ Who Profits: ${whoProfitsData.companies.length} companies`);
      console.log(`✅ BDS Movement: ${bdsMovementData.companies.length} companies`);
      console.log(`✅ UN Database: ${unDatabaseData.companies.length} companies`);

      // Step 2: Transform all data
      console.log('\n🔄 Step 2: Transforming All Data');
      console.log('=================================');
      
      const transformedData = await this.transformAllData(
        afscData,
        whoProfitsData,
        bdsMovementData,
        unDatabaseData
      );

      result.totalCompanies = transformedData.totalCompanies;
      result.totalEvidence = transformedData.totalEvidence;

      console.log(`✅ Total Companies: ${result.totalCompanies}`);
      console.log(`✅ Total Evidence: ${result.totalEvidence}`);

      // Step 3: Load into database
      console.log('\n💾 Step 3: Loading All Data into Database');
      console.log('==========================================');
      
      const loadResult = await this.loadAllData(transformedData);
      
      result.sourcesCreated = loadResult.sourcesCreated;
      result.companiesCreated = loadResult.companiesCreated;
      result.companiesUpdated = loadResult.companiesUpdated;
      result.evidenceCreated = loadResult.evidenceCreated;
      result.errors.push(...loadResult.errors);

      // Step 4: Summary
      console.log('\n📊 Pipeline Complete!');
      console.log('=====================');
      console.log(`🏢 Companies: ${result.companiesCreated} created, ${result.companiesUpdated} updated`);
      console.log(`🔍 Evidence: ${result.evidenceCreated} created`);
      console.log(`📚 Sources: ${result.sourcesCreated} created`);
      console.log(`📈 Total Coverage: ${result.totalCompanies} companies with BDS data`);

    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  private async scrapeAFSCData() {
    try {
      console.log('📡 Scraping AFSC Investigate...');
      return await this.afscScraper.scrapeCompanies(5); // 5 pages for testing
    } catch (error) {
      console.error('❌ AFSC scraping failed:', error);
      return { companies: [], totalPages: 0, scrapedAt: new Date() };
    }
  }

  private async scrapeWhoProfitsData() {
    try {
      console.log('📡 Scraping Who Profits...');
      return await this.whoProfitsScraper.scrapeCompanies(3); // 3 pages for testing
    } catch (error) {
      console.error('❌ Who Profits scraping failed:', error);
      return { companies: [], totalFound: 0, errors: [] };
    }
  }

  private async scrapeBDSMovementData() {
    try {
      console.log('📡 Scraping BDS Movement...');
      return await this.bdsMovementScraper.scrapeCompanies(3); // 3 pages for testing
    } catch (error) {
      console.error('❌ BDS Movement scraping failed:', error);
      return { companies: [], totalFound: 0, errors: [], scrapedAt: new Date() };
    }
  }

  private async scrapeUNDatabaseData() {
    try {
      console.log('📡 Scraping UN Database...');
      return await this.unDatabaseScraper.scrapeCompanies(3); // 3 pages for testing
    } catch (error) {
      console.error('❌ UN Database scraping failed:', error);
      return { companies: [], totalFound: 0, errors: [], scrapedAt: new Date() };
    }
  }

  private async transformAllData(
    afscData: any,
    whoProfitsData: any,
    bdsMovementData: any,
    unDatabaseData: any
  ) {
    console.log('🔄 Transforming AFSC data...');
    const afscTransformed = this.dataTransformer.transformAFSCData(afscData.companies);
    
    console.log('🔄 Transforming Who Profits data...');
    const whoProfitsTransformed = this.whoProfitsTransformer.transformWhoProfitsData(whoProfitsData.companies);
    
    console.log('🔄 Transforming BDS Movement data...');
    const bdsMovementTransformed = this.transformBDSMovementData(bdsMovementData.companies);
    
    console.log('🔄 Transforming UN Database data...');
    const unDatabaseTransformed = this.transformUNDatabaseData(unDatabaseData.companies);

    // Combine all transformed data
    const allCompanies = [
      ...afscTransformed.companies,
      ...whoProfitsTransformed.companies,
      ...bdsMovementTransformed.companies,
      ...unDatabaseTransformed.companies
    ];

    const allSources = [
      ...afscTransformed.sources,
      ...bdsMovementTransformed.sources,
      ...unDatabaseTransformed.sources
    ];

    const allEvidence = new Map<string, any[]>();
    
    // Merge evidence maps
    [afscTransformed.companyEvidenceMap, whoProfitsTransformed.companyEvidenceMap, 
     bdsMovementTransformed.companyEvidenceMap, unDatabaseTransformed.companyEvidenceMap]
      .forEach(evidenceMap => {
        evidenceMap.forEach((evidence, companyName) => {
          if (!allEvidence.has(companyName)) {
            allEvidence.set(companyName, []);
          }
          allEvidence.get(companyName)!.push(...evidence);
        });
      });

    return {
      companies: allCompanies,
      sources: allSources,
      companyEvidenceMap: allEvidence,
      totalCompanies: allCompanies.length,
      totalEvidence: Array.from(allEvidence.values()).reduce((sum, evidence) => sum + evidence.length, 0)
    };
  }

  private transformBDSMovementData(companies: any[]) {
    // Transform BDS Movement data to match our schema
    const transformedCompanies = companies.map(company => ({
      name: company.name,
      ticker: company.ticker,
      country: company.country,
      description: company.description
    }));

    const transformedSources = [{
      domain: 'bdsmovement.net',
      title: 'BDS Movement Corporate Campaigns',
      url: 'https://bdsmovement.net',
      publisher: 'BDS Movement'
    }];

    const companyEvidenceMap = new Map<string, any[]>();
    
    companies.forEach(company => {
      const evidence = company.evidence.map((evidenceText: string) => ({
        companyName: company.name,
        tagName: 'BDS',
        bdsCategory: company.category,
        strength: 'MEDIUM', // BDS Movement campaigns are generally medium strength
        notes: evidenceText,
        sourceUrl: company.campaignUrl,
        sourceDomain: 'bdsmovement.net',
        sourceTitle: 'BDS Movement Campaign'
      }));
      
      companyEvidenceMap.set(company.name, evidence);
    });

    return {
      companies: transformedCompanies,
      sources: transformedSources,
      companyEvidenceMap
    };
  }

  private transformUNDatabaseData(companies: any[]) {
    // Transform UN Database data to match our schema
    const transformedCompanies = companies.map(company => ({
      name: company.name,
      ticker: company.ticker,
      country: company.country,
      description: company.description
    }));

    const transformedSources = [{
      domain: 'ohchr.org',
      title: 'UN Human Rights Reports',
      url: 'https://www.ohchr.org',
      publisher: 'United Nations'
    }];

    const companyEvidenceMap = new Map<string, any[]>();
    
    companies.forEach(company => {
      const evidence = company.evidence.map((evidenceText: string) => ({
        companyName: company.name,
        tagName: 'BDS',
        bdsCategory: company.category,
        strength: 'HIGH', // UN reports are high strength
        notes: evidenceText,
        sourceUrl: company.reportUrl,
        sourceDomain: 'ohchr.org',
        sourceTitle: company.reportTitle
      }));
      
      companyEvidenceMap.set(company.name, evidence);
    });

    return {
      companies: transformedCompanies,
      sources: transformedSources,
      companyEvidenceMap
    };
  }

  private async loadAllData(transformedData: any) {
    try {
      console.log('💾 Loading all data into database...');
      
      // Use the existing database loader
      return await this.databaseLoader.loadBDSData(
        transformedData.companies,
        transformedData.sources,
        transformedData.companyEvidenceMap
      );
    } catch (error) {
      console.error('❌ Database loading failed:', error);
      return {
        companiesCreated: 0,
        companiesUpdated: 0,
        evidenceCreated: 0,
        sourcesCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';
import { WhoProfitsDataTransformer } from './src/services/data-transformer-whoprofits';
import { DatabaseLoader } from './src/services/database-loader';

async function runWhoProfitsPipeline() {
  const scraper = new WhoProfitsScraper();
  const transformer = new WhoProfitsDataTransformer();
  const loader = new DatabaseLoader();
  
  try {
    console.log('🚀 Starting Who Profits Data Pipeline...\n');
    
    // Step 1: Scrape Who Profits website
    console.log('📊 Step 1: Scraping Who Profits Website');
    console.log('========================================');
    
    const scrapingResult = await scraper.scrapeCompanies(3); // Get 3 pages of data
    
    console.log(`\n📈 Scraping Summary:`);
    console.log(`   Total Companies Found: ${scrapingResult.totalFound}`);
    console.log(`   Errors: ${scrapingResult.errors.length}`);
    
    if (scrapingResult.companies.length === 0) {
      console.log('❌ No companies found, exiting pipeline');
      return;
    }
    
    // Step 2: Transform scraped data
    console.log('\n🔄 Step 2: Transforming Scraped Data');
    console.log('=====================================');
    
    const transformedData = transformer.transformWhoProfitsData(scrapingResult.companies);
    
    console.log(`\n📊 Transformation Summary:`);
    console.log(`   Companies: ${transformedData.companies.length}`);
    console.log(`   Evidence Items: ${transformedData.evidence.length}`);
    
    // Step 3: Load data into database
    console.log('\n💾 Step 3: Loading Data into Database');
    console.log('======================================');
    
    // Load sources first
    const sourceResult = await loader.loadWhoProfitsSources(transformedData.evidence);
    console.log(`✅ Loaded ${sourceResult.added} sources (${sourceResult.existing} existing)`);
    
    // Load companies
    const companyResult = await loader.loadWhoProfitsCompanies(transformedData.companies);
    console.log(`✅ Loaded ${companyResult.added} companies (${companyResult.existing} existing)`);
    
    // Load evidence
    const evidenceResult = await loader.loadWhoProfitsEvidence(transformedData.companyEvidenceMap);
    console.log(`✅ Loaded ${evidenceResult.added} evidence items (${evidenceResult.existing} existing)`);
    
    // Step 4: Summary and next steps
    console.log('\n🔍 Step 4: Pipeline Summary');
    console.log('=============================');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Test screening with companies like:');
    console.log('      - ABB (Who Profits company)');
    console.log('      - A. Barkan and Co. (Who Profits company)');
    console.log('      - MSFT, KO (existing companies)');
    console.log('   3. Check that BDS evidence is now displayed');
    
    console.log('\n🎯 Who Profits Pipeline Complete!');
    console.log('\n💡 Summary:');
    console.log(`   📊 Added ${companyResult.added} new companies`);
    console.log(`   🔍 Added ${evidenceResult.added} new evidence items`);
    console.log(`   📑 Added ${sourceResult.added} new sources`);
    console.log('   ✅ BDS screening enhanced with Who Profits data');
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
  } finally {
    await loader.disconnect();
  }
}

// Run the pipeline
runWhoProfitsPipeline().catch(console.error);

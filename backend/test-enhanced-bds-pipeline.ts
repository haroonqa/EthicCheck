import { EnhancedBDSPipeline } from './src/services/enhanced-bds-pipeline';

// Test the enhanced BDS pipeline with multiple data sources
async function testEnhancedBDSPipeline() {
  const pipeline = new EnhancedBDSPipeline();
  
  try {
    console.log('🧪 Testing Enhanced BDS Data Pipeline...');
    console.log('========================================');
    console.log('This will scrape from:');
    console.log('  • AFSC Investigate');
    console.log('  • Who Profits');
    console.log('  • BDS Movement');
    console.log('  • UN Database');
    console.log('');
    
    // Run the full pipeline
    const result = await pipeline.runFullPipeline();
    
    // Display results
    console.log('\n📊 Pipeline Results Summary:');
    console.log('============================');
    console.log(`🏢 Total Companies: ${result.totalCompanies}`);
    console.log(`🔍 Total Evidence: ${result.totalEvidence}`);
    console.log(`📚 Sources Created: ${result.sourcesCreated}`);
    console.log(`🏢 Companies Created: ${result.companiesCreated}`);
    console.log(`🔄 Companies Updated: ${result.companiesUpdated}`);
    console.log(`🔍 Evidence Created: ${result.evidenceCreated}`);
    
    console.log('\n📈 Source Breakdown:');
    console.log('====================');
    console.log(`  AFSC Investigate: ${result.sourceBreakdown.afsc} companies`);
    console.log(`  Who Profits: ${result.sourceBreakdown.whoProfits} companies`);
    console.log(`  BDS Movement: ${result.sourceBreakdown.bdsMovement} companies`);
    console.log(`  UN Database: ${result.sourceBreakdown.unDatabase} companies`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Encountered:');
      console.log('======================');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎯 Enhanced BDS Pipeline Test Complete!');
    
    // Calculate coverage improvement
    const estimatedTotalCompanies = 1000; // Conservative estimate of companies with BDS involvement
    const coveragePercentage = (result.totalCompanies / estimatedTotalCompanies) * 100;
    
    console.log(`\n📊 Estimated Coverage: ${coveragePercentage.toFixed(1)}% of companies with BDS involvement`);
    
    if (coveragePercentage > 50) {
      console.log('🎉 Excellent coverage! Your BDS screening system now has comprehensive data.');
    } else if (coveragePercentage > 25) {
      console.log('👍 Good coverage! Consider adding more sources for even better screening.');
    } else {
      console.log('📈 Decent start! Continue adding sources to improve coverage.');
    }
    
  } catch (error) {
    console.error('❌ Enhanced BDS Pipeline test failed:', error);
  }
}

// Test individual scrapers
async function testIndividualScrapers() {
  console.log('\n🔍 Testing Individual Scrapers...');
  console.log('=================================');
  
  try {
    // Test BDS Movement scraper
    console.log('\n📡 Testing BDS Movement Scraper...');
    const { BDSMovementScraper } = await import('./src/services/scrapers/bds-movement-scraper');
    const bdsScraper = new BDSMovementScraper();
    const bdsResult = await bdsScraper.scrapeCompanies(1);
    console.log(`✅ BDS Movement: ${bdsResult.companies.length} companies found`);
    
    // Test UN Database scraper
    console.log('\n📡 Testing UN Database Scraper...');
    const { UNDatabaseScraper } = await import('./src/services/scrapers/un-database-scraper');
    const unScraper = new UNDatabaseScraper();
    const unResult = await unScraper.scrapeCompanies(1);
    console.log(`✅ UN Database: ${unResult.companies.length} companies found`);
    
  } catch (error) {
    console.error('❌ Individual scraper tests failed:', error);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Enhanced BDS Data Pipeline Testing');
  console.log('=====================================');
  
  testEnhancedBDSPipeline()
    .then(() => {
      return testIndividualScrapers();
    })
    .then(() => {
      console.log('\n✅ All Enhanced BDS Pipeline Tests Complete!');
    })
    .catch(console.error);
}


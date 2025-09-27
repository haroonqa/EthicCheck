import { BDSMovementScraper } from './src/services/scrapers/bds-movement-scraper';
import { UNDatabaseScraper } from './src/services/scrapers/un-database-scraper';
import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';

// Test BDS data collection from multiple sources
async function testBDSDataCollection() {
  console.log('🧪 Testing BDS Data Collection from Multiple Sources...');
  console.log('=====================================================');
  
  try {
    // Test 1: BDS Movement Scraper
    console.log('\n📡 Test 1: BDS Movement Corporate Campaigns');
    console.log('============================================');
    const bdsScraper = new BDSMovementScraper();
    const bdsResult = await bdsScraper.scrapeCompanies(1);
    console.log(`✅ BDS Movement: ${bdsResult.companies.length} companies found`);
    
    if (bdsResult.companies.length > 0) {
      console.log('Sample companies:');
      bdsResult.companies.slice(0, 3).forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.name} - ${company.category}`);
      });
    }
    
    // Test 2: AFSC Scraper (existing)
    console.log('\n📡 Test 2: AFSC Investigate');
    console.log('============================');
    const afscScraper = new AFSCScraper();
    const afscResult = await afscScraper.scrapeCompanies(1);
    console.log(`✅ AFSC: ${afscResult.companies.length} companies found`);
    
    // Test 3: Who Profits Scraper (existing)
    console.log('\n📡 Test 3: Who Profits');
    console.log('=======================');
    const whoProfitsScraper = new WhoProfitsScraper();
    const whoProfitsResult = await whoProfitsScraper.scrapeCompanies(1);
    console.log(`✅ Who Profits: ${whoProfitsResult.companies.length} companies found`);
    
    // Test 4: UN Database Scraper (may have access issues)
    console.log('\n📡 Test 4: UN Database');
    console.log('=======================');
    const unScraper = new UNDatabaseScraper();
    const unResult = await unScraper.scrapeCompanies(1);
    console.log(`✅ UN Database: ${unResult.companies.length} companies found`);
    
    // Summary
    console.log('\n📊 Data Collection Summary:');
    console.log('============================');
    const totalCompanies = bdsResult.companies.length + 
                          afscResult.companies.length + 
                          whoProfitsResult.companies.length + 
                          unResult.companies.length;
    
    console.log(`🏢 Total Companies Found: ${totalCompanies}`);
    console.log(`  • BDS Movement: ${bdsResult.companies.length}`);
    console.log(`  • AFSC: ${afscResult.companies.length}`);
    console.log(`  • Who Profits: ${whoProfitsResult.companies.length}`);
    console.log(`  • UN Database: ${unResult.companies.length}`);
    
    // Coverage estimation
    const estimatedTotal = 1000; // Conservative estimate
    const coveragePercentage = (totalCompanies / estimatedTotal) * 100;
    
    console.log(`\n📈 Estimated Coverage: ${coveragePercentage.toFixed(1)}% of companies with BDS involvement`);
    
    if (coveragePercentage > 50) {
      console.log('🎉 Excellent coverage! Your BDS screening system now has comprehensive data.');
    } else if (coveragePercentage > 25) {
      console.log('👍 Good coverage! Consider adding more sources for even better screening.');
    } else {
      console.log('📈 Decent start! Continue adding sources to improve coverage.');
    }
    
    // Data quality assessment
    console.log('\n🔍 Data Quality Assessment:');
    console.log('==========================');
    
    const sourcesWithData = [bdsResult, afscResult, whoProfitsResult, unResult]
      .filter(result => result.companies.length > 0).length;
    
    console.log(`✅ Sources with data: ${sourcesWithData}/4`);
    console.log(`📊 Data diversity: ${sourcesWithData >= 3 ? 'High' : sourcesWithData >= 2 ? 'Medium' : 'Low'}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('==================');
    
    if (bdsResult.companies.length === 0) {
      console.log('🔴 BDS Movement scraper needs investigation - may need different selectors');
    }
    
    if (unResult.companies.length === 0) {
      console.log('🔴 UN Database has access restrictions - consider alternative sources');
    }
    
    if (afscResult.companies.length > 0 && whoProfitsResult.companies.length > 0) {
      console.log('✅ AFSC and Who Profits are working well - good foundation');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    console.log('1. Investigate BDS Movement scraper if no data found');
    console.log('2. Find alternative sources for UN data');
    console.log('3. Test data transformation and database loading');
    console.log('4. Implement automated scraping schedules');
    
  } catch (error) {
    console.error('❌ BDS Data Collection test failed:', error);
  }
}

// Test individual scraper functionality
async function testIndividualScrapers() {
  console.log('\n🔍 Testing Individual Scraper Functionality...');
  console.log('=============================================');
  
  try {
    // Test BDS Movement scraper in detail
    console.log('\n📡 Testing BDS Movement Scraper Details...');
    const bdsScraper = new BDSMovementScraper();
    
    // Test with a smaller page limit
    const result = await bdsScraper.scrapeCompanies(1);
    
    if (result.companies.length > 0) {
      console.log(`✅ Found ${result.companies.length} companies`);
      
      // Show detailed info for first company
      const firstCompany = result.companies[0];
      console.log('\n📋 Sample Company Details:');
      console.log(`  Name: ${firstCompany.name}`);
      console.log(`  Category: ${firstCompany.category}`);
      console.log(`  Description: ${firstCompany.description.substring(0, 100)}...`);
      console.log(`  Evidence Count: ${firstCompany.evidence.length}`);
      console.log(`  Campaign URL: ${firstCompany.campaignUrl}`);
      
      if (firstCompany.evidence.length > 0) {
        console.log('\n🔍 Sample Evidence:');
        firstCompany.evidence.slice(0, 2).forEach((evidence, index) => {
          console.log(`  ${index + 1}. ${evidence.substring(0, 80)}...`);
        });
      }
    } else {
      console.log('⚠️ No companies found - may need to adjust selectors');
    }
    
  } catch (error) {
    console.error('❌ Individual scraper test failed:', error);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 BDS Data Collection Testing');
  console.log('==============================');
  
  testBDSDataCollection()
    .then(() => {
      return testIndividualScrapers();
    })
    .then(() => {
      console.log('\n✅ All BDS Data Collection Tests Complete!');
    })
    .catch(console.error);
}


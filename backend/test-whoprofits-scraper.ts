import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';
import { WhoProfitsDataTransformer } from './src/services/data-transformer-whoprofits';

async function testWhoProfitsScraper() {
  const scraper = new WhoProfitsScraper();
  const transformer = new WhoProfitsDataTransformer();
  
  try {
    console.log('🚀 Testing Who Profits Scraper...\n');
    
    // Test 1: Scrape Who Profits website
    console.log('📊 Test 1: Scraping Who Profits Website');
    console.log('========================================');
    
    const scrapingResult = await scraper.scrapeCompanies(2); // Limit to 2 pages for testing
    
    console.log(`\n📈 Scraping Summary:`);
    console.log(`   Total Companies Found: ${scrapingResult.totalFound}`);
    console.log(`   Errors: ${scrapingResult.errors.length}`);
    
    if (scrapingResult.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      scrapingResult.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Test 2: Transform scraped data
    if (scrapingResult.companies.length > 0) {
      console.log('\n🔄 Test 2: Transforming Scraped Data');
      console.log('=====================================');
      
      const transformedData = transformer.transformWhoProfitsData(scrapingResult.companies);
      
      console.log(`\n📊 Transformation Summary:`);
      console.log(`   Companies: ${transformedData.companies.length}`);
      console.log(`   Evidence Items: ${transformedData.evidence.length}`);
      
      // Show sample companies
      console.log(`\n📋 Sample Companies:`);
      transformedData.companies.slice(0, 5).forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.name}`);
        if (company.ticker) console.log(`   Ticker: ${company.ticker}`);
        if (company.country) console.log(`   Country: ${company.country}`);
        if (company.description) console.log(`   Description: ${company.description.substring(0, 100)}...`);
      });
      
      // Show sample evidence
      console.log(`\n🔍 Sample Evidence:`);
      transformedData.evidence.slice(0, 5).forEach((evidence, index) => {
        console.log(`\n${index + 1}. ${evidence.companyName}`);
        console.log(`   Tag: ${evidence.tagName}`);
        console.log(`   Strength: ${evidence.strength}`);
        console.log(`   Notes: ${evidence.notes.substring(0, 100)}...`);
        console.log(`   Source: ${evidence.sourceDomain}`);
      });
      
    } else {
      console.log('\n❌ No companies found to transform');
    }
    
    console.log('\n🎯 Who Profits Scraper Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWhoProfitsScraper().catch(console.error);

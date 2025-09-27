import { TradeUnionBDSScraper } from './src/services/scrapers/trade-union-bds-scraper';

async function testTradeUnionBDS() {
  console.log('🏭 Testing Trade Union BDS Scraper');
  console.log('==================================\n');

  try {
    const scraper = new TradeUnionBDSScraper();
    
    console.log('🚀 Starting Trade Union BDS scraping...\n');
    
    const result = await scraper.scrapeCompanies();
    
    console.log('\n📊 Trade Union BDS Scraping Results:');
    console.log('=====================================');
    console.log(`🏭 Total Companies Found: ${result.totalFound}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`📅 Scraped At: ${result.scrapedAt}`);
    
    if (result.companies.length > 0) {
      console.log('\n🏭 Sample Companies:');
      console.log('=====================');
      
      result.companies.slice(0, 10).forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}`);
        console.log(`   Boycott Type: ${company.boycottType}`);
        console.log(`   Country: ${company.country}`);
        console.log(`   Sector: ${company.sector}`);
        console.log(`   Trade Union: ${company.tradeUnion}`);
        console.log(`   Evidence Count: ${company.evidence.length}`);
        console.log(`   Description: ${company.description.substring(0, 80)}...`);
        console.log('');
      });
      
      if (result.companies.length > 10) {
        console.log(`... and ${result.companies.length - 10} more companies`);
      }
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Encountered:');
      console.log('======================');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Trade Union BDS Scraper Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing Trade Union BDS scraper:', error);
  }
}

testTradeUnionBDS();

import { UNDatabaseScraper } from './src/services/scrapers/un-database-scraper';

async function testUNDatabase() {
  console.log('🌐 Testing UN Database Scraper');
  console.log('================================\n');

  try {
    const scraper = new UNDatabaseScraper();
    
    console.log('🚀 Starting UN Database settlement reports scraping...\n');
    
    const result = await scraper.scrapeCompanies(3);
    
    console.log('\n📊 UN Database Scraping Results:');
    console.log('==================================');
    console.log(`🏢 Total Companies Found: ${result.totalFound}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`📅 Scraped At: ${result.scrapedAt}`);
    
    if (result.companies.length > 0) {
      console.log('\n🏢 Sample Companies:');
      console.log('=====================');
      
      result.companies.slice(0, 10).forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}`);
        console.log(`   Category: ${company.category}`);
        console.log(`   Country: ${company.country || 'Unknown'}`);
        console.log(`   Ticker: ${company.ticker || 'None'}`);
        console.log(`   Report Title: ${company.reportTitle.substring(0, 80)}...`);
        console.log(`   Evidence Count: ${company.evidence.length}`);
        console.log(`   UN Resolution: ${company.unResolution || 'None'}`);
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
    
    console.log('\n✅ UN Database Scraper Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing UN Database scraper:', error);
  }
}

testUNDatabase();


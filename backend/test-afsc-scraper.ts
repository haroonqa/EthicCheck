import { AFSCScraper } from './src/services/scrapers/afsc-scraper';

async function testAFSCScraper() {
  console.log('🧪 Testing AFSC Scraper...');
  
  try {
    const scraper = new AFSCScraper();
    
    // Test with just 2 pages to be polite
    const result = await scraper.scrapeCompanies(2);
    
    console.log('\n📊 Scraping Results:');
    console.log(`Total companies found: ${result.companies.length}`);
    console.log(`Pages scraped: ${result.totalPages}`);
    console.log(`Scraped at: ${result.scrapedAt}`);
    
    console.log('\n🏢 Sample Companies:');
    result.companies.slice(0, 5).forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name}`);
      console.log(`   Country: ${company.country || 'Unknown'}`);
      console.log(`   Category: ${company.category || 'Unknown'}`);
      console.log(`   Tags: ${company.tags.join(', ') || 'None'}`);
      console.log(`   Evidence: ${company.evidence.length} items`);
      if (company.profileUrl) {
        console.log(`   Profile: ${company.profileUrl}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing AFSC scraper:', error);
  }
}

// Run the test
testAFSCScraper();

import { PACBIAcademicScraper } from './src/services/scrapers/pacbi-academic-scraper';

async function testPACBIAcademic() {
  console.log('🎓 Testing PACBI Academic Boycott Scraper');
  console.log('==========================================\n');

  try {
    const scraper = new PACBIAcademicScraper();
    
    console.log('🚀 Starting PACBI academic institution scraping...\n');
    
    const result = await scraper.scrapeInstitutions();
    
    console.log('\n📊 PACBI Academic Scraping Results:');
    console.log('=====================================');
    console.log(`🏫 Total Institutions Found: ${result.totalFound}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`📅 Scraped At: ${result.scrapedAt}`);
    
    if (result.institutions.length > 0) {
      console.log('\n🏫 Sample Institutions:');
      console.log('=======================');
      
      result.institutions.slice(0, 10).forEach((institution, index) => {
        console.log(`${index + 1}. ${institution.name}`);
        console.log(`   Category: ${institution.category}`);
        console.log(`   Boycott Type: ${institution.boycottType}`);
        console.log(`   Country: ${institution.country}`);
        console.log(`   Evidence Count: ${institution.evidence.length}`);
        console.log(`   Description: ${institution.description.substring(0, 80)}...`);
        console.log('');
      });
      
      if (result.institutions.length > 10) {
        console.log(`... and ${result.institutions.length - 10} more institutions`);
      }
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors Encountered:');
      console.log('======================');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ PACBI Academic Scraper Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing PACBI academic scraper:', error);
  }
}

testPACBIAcademic();


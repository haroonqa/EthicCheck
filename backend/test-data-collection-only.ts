import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';
import { PACBIAcademicScraper } from './src/services/scrapers/pacbi-academic-scraper';

async function testDataCollection() {
  console.log('🧪 Testing Data Collection (No Database Required)...\n');

  try {
    // Test AFSC Scraper
    console.log('🌐 Testing AFSC Scraper...');
    const afscScraper = new AFSCScraper();
    const afscResult = await afscScraper.scrapeCompanies(2); // Just 2 pages for testing
    console.log(`✅ AFSC: Found ${afscResult.companies.length} companies`);
    
    if (afscResult.companies.length > 0) {
      console.log('Sample companies:');
      afscResult.companies.slice(0, 3).forEach(company => {
        console.log(`  - ${company.name} (${company.country || 'Unknown country'})`);
        console.log(`    Evidence: ${company.evidence.length} items`);
        console.log(`    Tags: ${company.tags.join(', ')}`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test Who Profits Scraper
    console.log('🏢 Testing Who Profits Scraper...');
    const whoProfitsScraper = new WhoProfitsScraper();
    const whoProfitsResult = await whoProfitsScraper.scrapeCompanies(2);
    console.log(`✅ Who Profits: Found ${whoProfitsResult.companies.length} companies`);
    
    if (whoProfitsResult.companies.length > 0) {
      console.log('Sample companies:');
      whoProfitsResult.companies.slice(0, 3).forEach(company => {
        console.log(`  - ${company.name} (${company.ticker || 'No ticker'})`);
        console.log(`    Category: ${company.category || 'Unknown'}`);
        console.log(`    Involvement: ${company.involvement || 'No details'}`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test PACBI Academic Scraper
    console.log('🎓 Testing PACBI Academic Scraper...');
    const pacbiScraper = new PACBIAcademicScraper();
    const pacbiResult = await pacbiScraper.scrapeInstitutions(2);
    console.log(`✅ PACBI Academic: Found ${pacbiResult.institutions.length} institutions`);
    
    if (pacbiResult.institutions.length > 0) {
      console.log('Sample institutions:');
      pacbiResult.institutions.slice(0, 3).forEach(institution => {
        console.log(`  - ${institution.name} (${institution.country})`);
        console.log(`    Category: ${institution.category}`);
        console.log(`    Boycott Type: ${institution.boycottType}`);
      });
    }

    console.log('\n🎉 Data Collection Test Complete!');
    console.log('=====================================');
    console.log(`📊 Total companies found: ${afscResult.companies.length + whoProfitsResult.companies.length + pacbiResult.institutions.length}`);
    console.log(`🌐 Sources tested: 3`);
    console.log(`⏱️  Test completed at: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDataCollection().catch(console.error);






import { AFSCScraper } from './src/services/scrapers/afsc-scraper';
import { WhoProfitsScraper } from './src/services/scrapers/whoprofits-scraper';
import { PACBIAcademicScraper } from './src/services/scrapers/pacbi-academic-scraper';
import { TradeUnionBDSScraper } from './src/services/scrapers/trade-union-bds-scraper';
import { UNDatabaseScraper } from './src/services/scrapers/un-database-scraper';

async function testSimplePipeline() {
  console.log('🧪 Testing Simple BDS Pipeline');
  console.log('================================\n');

  try {
    // Test individual scrapers
    const scrapers = [
      { name: 'AFSC', scraper: new AFSCScraper(), method: 'scrapeCompanies' },
      { name: 'Who Profits', scraper: new WhoProfitsScraper(), method: 'scrapeCompanies' },
      { name: 'PACBI Academic', scraper: new PACBIAcademicScraper(), method: 'scrapeInstitutions' },
      { name: 'Trade Union BDS', scraper: new TradeUnionBDSScraper(), method: 'scrapeCompanies' },
      { name: 'UN Database', scraper: new UNDatabaseScraper(), method: 'scrapeCompanies' }
    ];

    let totalCompanies = 0;
    let totalEvidence = 0;

    for (const { name, scraper, method } of scrapers) {
      console.log(`📡 Testing ${name}...`);
      
      try {
        let result;
        if (method === 'scrapeInstitutions') {
          result = await (scraper as any)[method](2);
          const companies = result.institutions?.length || 0;
          const evidence = result.institutions?.reduce((sum: number, inst: any) => sum + (inst.evidence?.length || 0), 0) || 0;
          totalCompanies += companies;
          totalEvidence += evidence;
          console.log(`   ✅ ${companies} institutions, ${evidence} evidence items`);
        } else {
          result = await (scraper as any)[method](2);
          const companies = result.companies?.length || 0;
          const evidence = result.companies?.reduce((sum: number, company: any) => sum + (company.evidence?.length || 0), 0) || 0;
          totalCompanies += companies;
          totalEvidence += evidence;
          console.log(`   ✅ ${companies} companies, ${evidence} evidence items`);
        }
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('============');
    console.log(`🏢 Total Companies: ${totalCompanies}`);
    console.log(`📝 Total Evidence: ${totalEvidence}`);
    console.log(`🌐 Sources Tested: ${scrapers.length}`);

    console.log('\n🎉 Simple Pipeline Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimplePipeline();


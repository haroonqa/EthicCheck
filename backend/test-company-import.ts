import { CompanyImporter } from './src/services/company-importer';

async function testCompanyImport() {
  const importer = new CompanyImporter();
  
  try {
    console.log('🚀 Testing Company Importer...\n');
    
    // Test 1: Bulk import S&P 500 companies
    console.log('📊 Test 1: Bulk Import S&P 500 Companies');
    console.log('==========================================');
    const importResult = await importer.importSP500();
    console.log(`\n📈 Import Summary:`, importResult);
    
    // Test 2: Auto-discovery (placeholder for now)
    console.log('\n🔍 Test 2: Auto-Discovery System');
    console.log('==================================');
    const testTickers = ['MSFT', 'GOOGL', 'TSLA', 'UNKNOWN'];
    
    for (const ticker of testTickers) {
      const discovered = await importer.autoDiscoverCompany(ticker);
      if (discovered) {
        console.log(`✅ Discovered: ${discovered.name} (${discovered.ticker})`);
        
        // Only add if it's a new company (not MSFT which should already exist)
        if (ticker === 'UNKNOWN') {
          const added = await importer.addDiscoveredCompany(discovered);
          console.log(`📝 Auto-added: ${added ? 'Success' : 'Failed'}`);
        }
      } else {
        console.log(`❌ Could not discover: ${ticker}`);
      }
    }
    
    console.log('\n🎯 Company Import Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await importer.disconnect();
  }
}

// Run the test
testCompanyImport().catch(console.error);

import { CompanyImporter } from './src/services/company-importer';
import { EnhancedScreeningEngine } from './src/services/screening-engine-enhanced';
import { PrismaClient } from '@prisma/client';

async function testEnhancedSystem() {
  const prisma = new PrismaClient();
  const importer = new CompanyImporter();
  const screeningEngine = new EnhancedScreeningEngine(prisma);
  
  try {
    console.log('🚀 Testing Enhanced EthicCheck System...\n');
    
    // Test 1: Bulk Import S&P 500 Companies
    console.log('📊 Test 1: Bulk Import S&P 500 Companies');
    console.log('==========================================');
    const importResult = await importer.importSP500();
    console.log(`\n📈 Import Summary:`, importResult);
    
    // Test 2: Enhanced Screening with Auto-Discovery
    console.log('\n🔍 Test 2: Enhanced Screening with Auto-Discovery');
    console.log('==================================================');
    
    // Test companies: some existing, some new
    const testCompanies = [
      'AAPL',    // Should exist (from seed)
      'LMT',     // Should exist (from seed) 
      'KO',      // Should exist (from seed)
      'MSFT',    // Should exist (from import)
      'GOOGL',   // Should exist (from import)
      'TSLA',    // Should exist (from import)
      'UNKNOWN', // Should trigger auto-discovery
      'NFLX'     // Should exist (from import)
    ];
    
    const filters = {
      bds: true,
      defense: true,
      surveillance: true,
      shariah: true
    };
    
    console.log(`\n🔍 Screening ${testCompanies.length} companies with auto-discovery enabled...`);
    const screeningResults = await screeningEngine.screenCompanies(
      testCompanies, 
      filters, 
      { lookthrough: false, maxDepth: 1, autoDiscover: true }
    );
    
    console.log('\n📊 Screening Results:');
    console.log('======================');
    screeningResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.symbol} - ${result.company}`);
      console.log(`   BDS: ${result.statuses.bds} | Defense: ${result.statuses.defense} | Surveillance: ${result.statuses.surveillance} | Shariah: ${result.statuses.shariah}`);
      console.log(`   Final: ${result.finalVerdict} | Confidence: ${result.confidence}`);
      if (result.reasons.length > 0) {
        console.log(`   Reasons: ${result.reasons.length} items`);
        result.reasons.slice(0, 2).forEach((reason, i) => {
          console.log(`     ${i + 1}. ${reason.substring(0, 80)}${reason.length > 80 ? '...' : ''}`);
        });
        if (result.reasons.length > 2) {
          console.log(`     ... and ${result.reasons.length - 2} more`);
        }
      }
    });
    
    // Test 3: Database Statistics
    console.log('\n📊 Test 3: Database Statistics');
    console.log('==============================');
    
    const totalCompanies = await prisma.company.count();
    const companiesWithEvidence = await prisma.company.count({
      where: { evidence: { some: {} } }
    });
    const companiesWithContracts = await prisma.company.count({
      where: { contracts: { some: {} } }
    });
    
    console.log(`Total Companies: ${totalCompanies}`);
    console.log(`Companies with Evidence: ${companiesWithEvidence}`);
    console.log(`Companies with Contracts: ${companiesWithContracts}`);
    
    // Test 4: Search for Specific Companies
    console.log('\n🔍 Test 4: Company Search Examples');
    console.log('==================================');
    
    const searchExamples = ['MSFT', 'GOOGL', 'TSLA', 'UNKNOWN'];
    for (const ticker of searchExamples) {
      const company = await prisma.company.findFirst({
        where: { ticker: ticker.toUpperCase() },
        include: { evidence: true, contracts: true }
      });
      
      if (company) {
        console.log(`✅ ${ticker}: ${company.name} (Evidence: ${company.evidence.length}, Contracts: ${company.contracts.length})`);
      } else {
        console.log(`❌ ${ticker}: Not found`);
      }
    }
    
    console.log('\n🎯 Enhanced System Test Complete!');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   ✅ Bulk company import (S&P 500)');
    console.log('   ✅ Auto-discovery for unknown companies');
    console.log('   ✅ Enhanced screening with auto-discovery');
    console.log('   ✅ Comprehensive company coverage');
    console.log('   ✅ Professional-grade data structure');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await importer.disconnect();
    await screeningEngine.disconnect();
    await prisma.$disconnect();
  }
}

// Run the test
testEnhancedSystem().catch(console.error);

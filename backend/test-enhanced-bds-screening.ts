import { PrismaClient } from '@prisma/client';
import { ScreeningEngine } from './src/services/screening-engine';
import { BdsCategory } from './src/types/api';

async function testEnhancedBdsScreening() {
  const prisma = new PrismaClient();
  const screeningEngine = new ScreeningEngine(prisma);

  try {
    console.log('🧪 Testing Enhanced BDS Screening System\n');

    // Test 1: Screen with all BDS categories
    console.log('📊 Test 1: Screening with all BDS categories');
    console.log('============================================');
    
    const allCategoriesResult = await screeningEngine.screenCompanies(
      ['ABB'], // Test with ABB (Who Profits company)
      {
        bds: {
          enabled: true,
          categories: [
            'economic_exploitation',
            'exploitation_occupied_resources',
            'settlement_enterprise',
            'israeli_construction_occupied_land',
            'services_to_settlements',
            'other_bds_activities'
          ]
        },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );

    console.log(`Results: ${allCategoriesResult.length} companies screened`);
    for (const result of allCategoriesResult) {
      console.log(`\n🏢 ${result.company} (${result.symbol})`);
      console.log(`   Overall BDS Status: ${result.statuses.bds.overall}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
      console.log(`   Confidence: ${result.confidence}`);
      
      if (result.statuses.bds.categories && result.statuses.bds.categories.length > 0) {
        console.log('   BDS Categories:');
        for (const category of result.statuses.bds.categories) {
          const categoryLabel = getCategoryLabel(category.category);
          console.log(`     - ${categoryLabel}: ${category.status}`);
          if (category.evidence) {
            console.log(`       Evidence: ${category.evidence.join(', ')}`);
          }
        }
      }
      
      if (result.reasons.length > 0) {
        console.log('   Reasons:');
        result.reasons.forEach(reason => console.log(`     - ${reason}`));
      }
    }

    // Test 2: Screen with specific BDS categories only
    console.log('\n\n📊 Test 2: Screening with specific BDS categories only');
    console.log('=======================================================');
    
    const specificCategoriesResult = await screeningEngine.screenCompanies(
      ['ABB'],
      {
        bds: {
          enabled: true,
          categories: ['settlement_enterprise', 'economic_exploitation']
        },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );

    console.log(`Results: ${specificCategoriesResult.length} companies screened`);
    for (const result of specificCategoriesResult) {
      console.log(`\n🏢 ${result.company} (${result.symbol})`);
      console.log(`   Overall BDS Status: ${result.statuses.bds.overall}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
      
      if (result.statuses.bds.categories && result.statuses.bds.categories.length > 0) {
        console.log('   BDS Categories Screened:');
        for (const category of result.statuses.bds.categories) {
          const categoryLabel = getCategoryLabel(category.category);
          console.log(`     - ${categoryLabel}: ${category.status}`);
        }
      }
    }

    // Test 3: Screen with BDS disabled
    console.log('\n\n📊 Test 3: Screening with BDS disabled');
    console.log('=======================================');
    
    const bdsDisabledResult = await screeningEngine.screenCompanies(
      ['ABB'],
      {
        bds: { enabled: false },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );

    console.log(`Results: ${bdsDisabledResult.length} companies screened`);
    for (const result of bdsDisabledResult) {
      console.log(`\n🏢 ${result.company} (${result.symbol})`);
      console.log(`   BDS Status: ${result.statuses.bds.overall}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
    }

    console.log('\n✅ Enhanced BDS Screening Tests Complete!');
    console.log('\n💡 Key Improvements:');
    console.log('   • Specific BDS categories instead of generic "BDS"');
    console.log('   • Granular screening by category type');
    console.log('   • Detailed evidence tracking per category');
    console.log('   • Flexible filtering options');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCategoryLabel(category: BdsCategory): string {
  switch (category) {
    case 'economic_exploitation':
      return 'Economic Exploitation';
    case 'exploitation_occupied_resources':
      return 'Exploitation of Occupied Production and Resources';
    case 'settlement_enterprise':
      return 'Settlement Enterprise';
    case 'israeli_construction_occupied_land':
      return 'Israeli Construction on Occupied Land';
    case 'services_to_settlements':
      return 'Services to the Settlements';
    case 'other_bds_activities':
      return 'Other BDS Activities';
    default:
      return 'Unknown Category';
  }
}

// Run the test
testEnhancedBdsScreening().catch(console.error);

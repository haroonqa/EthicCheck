import { ScreeningEngine } from './src/services/screening-engine';
import { PrismaClient } from '@prisma/client';

async function testABBScreening() {
  const prisma = new PrismaClient();
  const engine = new ScreeningEngine(prisma);
  
  try {
    console.log('🔍 Testing ABB BDS Screening');
    console.log('==============================');
    
    // Test ABB screening
    const results = await engine.screenCompanies(['ABB'], {
      bds: { enabled: true },
      defense: false,
      surveillance: false,
      shariah: false
    });
    
    if (results.length > 0) {
      const result = results[0];
      console.log(`\n📊 ABB Screening Results:`);
      console.log(`   Company: ${result.company}`);
      console.log(`   BDS Status: ${JSON.stringify(result.statuses.bds)}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Reasons: ${result.reasons.join(', ')}`);
      
      if (result.sources && result.sources.length > 0) {
        console.log(`\n📚 Sources:`);
        result.sources.forEach(source => {
          console.log(`   - ${source.label} (${source.url})`);
        });
      }
    } else {
      console.log('❌ No screening results found for ABB');
    }
    
  } catch (error) {
    console.error('❌ ABB screening test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
if (require.main === module) {
  testABBScreening()
    .then(() => {
      console.log('\n✅ ABB Screening Test Complete!');
    })
    .catch(console.error);
}

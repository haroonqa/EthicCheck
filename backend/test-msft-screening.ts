import { ScreeningEngine } from './src/services/screening-engine';
import { PrismaClient } from '@prisma/client';

async function testMicrosoftScreening() {
  const prisma = new PrismaClient();
  const engine = new ScreeningEngine(prisma);
  
  try {
    console.log('🔍 Testing Microsoft BDS Screening & Evidence');
    console.log('==============================================');
    
    // First, let's check Microsoft's evidence directly
    const microsoft = await prisma.company.findFirst({
      where: { name: { contains: 'Microsoft' } },
      include: { 
        evidence: { 
          include: { 
            tag: true, 
            source: true 
          } 
        } 
      }
    });
    
    if (microsoft) {
      console.log(`\n📊 Microsoft Company Details:`);
      console.log(`   Name: ${microsoft.name}`);
      console.log(`   Ticker: ${microsoft.ticker}`);
      console.log(`   Total Evidence: ${microsoft.evidence.length}`);
      
      console.log(`\n🔍 BDS Evidence Items:`);
      const bdsEvidence = microsoft.evidence.filter(e => e.tag.name === 'BDS');
      console.log(`   BDS Evidence Count: ${bdsEvidence.length}`);
      
      bdsEvidence.forEach((evidence, index) => {
        console.log(`   ${index + 1}. ${evidence.notes} | Source: ${evidence.source.title}`);
      });
    }
    
    // Now test the screening logic
    console.log(`\n🧪 Testing Screening Logic:`);
    const results = await engine.screenCompanies(['MSFT'], {
      bds: { enabled: true },
      defense: false,
      surveillance: false,
      shariah: false
    });
    
    if (results.length > 0) {
      const result = results[0];
      console.log(`\n📊 MSFT Screening Results:`);
      console.log(`   Company: ${result.company}`);
      console.log(`   BDS Status: ${JSON.stringify(result.statuses.bds)}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Reasons: ${result.reasons.join(', ')}`);
      
      if (result.sources && result.sources.length > 0) {
        console.log(`\n📚 Sources in Result:`);
        result.sources.forEach(source => {
          console.log(`   - ${source.label} (${source.url})`);
        });
      }
    } else {
      console.log('❌ No screening results found for MSFT');
    }
    
  } catch (error) {
    console.error('❌ Microsoft screening test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
if (require.main === module) {
  testMicrosoftScreening()
    .then(() => {
      console.log('\n✅ Microsoft Screening Test Complete!');
    })
    .catch(console.error);
}


import { ScreeningEngine } from './src/services/screening-engine';
import { PrismaClient } from '@prisma/client';

async function investigateTesla() {
  const prisma = new PrismaClient();
  const engine = new ScreeningEngine(prisma);
  
  try {
    console.log('🔍 Investigating Tesla BDS Evidence');
    console.log('===================================');
    
    // First, check if Tesla exists in the database
    const tesla = await prisma.company.findFirst({
      where: {
        OR: [
          { ticker: 'TSLA' },
          { name: { contains: 'Tesla', mode: 'insensitive' } }
        ]
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      }
    });
    
    if (!tesla) {
      console.log('❌ Tesla not found in database');
      return;
    }
    
    console.log(`📊 Tesla Company: ${tesla.name} (${tesla.ticker || 'No ticker'})`);
    console.log(`📊 Total Evidence Items: ${tesla.evidence.length}`);
    
    // Check BDS evidence specifically
    const bdsEvidence = tesla.evidence.filter(e => e.tag.name === 'BDS');
    console.log(`📊 BDS Evidence Items: ${bdsEvidence.length}`);
    
    if (bdsEvidence.length > 0) {
      console.log('\n📋 BDS Evidence Details:');
      bdsEvidence.forEach((evidence, index) => {
        console.log(`  ${index + 1}. Notes: ${evidence.notes?.substring(0, 100) || 'No notes'}...`);
        console.log(`     Strength: ${evidence.strength}`);
        console.log(`     BDS Category: ${evidence.bdsCategory || 'NULL'}`);
        console.log(`     Source: ${evidence.source.title}`);
        console.log('');
      });
    }
    
    // Now test the screening
    console.log('\n🧪 Testing Tesla Screening:');
    console.log('============================');
    
    const results = await engine.screenCompanies(['TSLA'], {
      bds: { enabled: true },
      defense: false,
      surveillance: false,
      shariah: false
    });
    
    if (results.length > 0) {
      const result = results[0];
      console.log(`   Company: ${result.company}`);
      console.log(`   BDS Status: ${result.statuses.bds.overall}`);
      console.log(`   Final Verdict: ${result.finalVerdict}`);
      console.log(`   Confidence: ${result.confidence}`);
      
      if (result.statuses.bds.categories && result.statuses.bds.categories.length > 0) {
        console.log(`   Categories:`);
        result.statuses.bds.categories.forEach(cat => {
          console.log(`     - ${cat.category}: ${cat.status}`);
          if (cat.evidence) {
            console.log(`       Evidence: ${cat.evidence.join(', ')}`);
          }
        });
      } else {
        console.log(`   Categories: None found`);
      }
      
      console.log(`   Reasons: [${result.reasons.join(', ')}]`);
    } else {
      console.log(`   No screening results`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateTesla().catch(console.error);

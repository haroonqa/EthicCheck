import { PrismaClient } from '@prisma/client';

async function checkTeslaEvidence() {
  const prisma = new PrismaClient();
  
  try {
    // Find Tesla
    const tesla = await prisma.company.findFirst({
      where: {
        OR: [
          { ticker: 'TSLA' },
          { name: { contains: 'Tesla', mode: 'insensitive' } }
        ]
      },
      include: {
        evidence: {
          include: { tag: true, source: true }
        }
      }
    });
    
    if (!tesla) {
      console.log('❌ Tesla not found');
      return;
    }
    
    console.log('📊 Tesla Evidence Analysis:');
    console.log('============================');
    console.log(`Company: ${tesla.name} (${tesla.ticker})`);
    console.log(`Total Evidence: ${tesla.evidence.length}`);
    
    if (tesla.evidence.length > 0) {
      console.log('\nEvidence Details:');
      tesla.evidence.forEach((e, i) => {
        console.log(`${i+1}. Tag: ${e.tag.name}, Strength: ${e.strength}`);
        console.log(`   Notes: ${e.notes || 'No notes'}`);
        console.log(`   BDS Category: ${e.bdsCategory || 'NULL'}`);
        console.log('');
      });
    } else {
      console.log('\n✅ No evidence found - Tesla should show CLEAN for all filters');
    }
    
    // Also check if there are any other TSLA variations
    const allTesla = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: 'Tesla', mode: 'insensitive' } },
          { name: { contains: 'TSLA', mode: 'insensitive' } }
        ]
      },
      include: {
        evidence: { include: { tag: true } }
      }
    });
    
    console.log(`\n🔍 All Tesla-related companies: ${allTesla.length}`);
    allTesla.forEach((company, i) => {
      console.log(`${i+1}. ${company.name} (${company.ticker}) - ${company.evidence.length} evidence`);
    });
    
  } finally {
    await prisma.$disconnect();
  }
}

checkTeslaEvidence().catch(console.error);

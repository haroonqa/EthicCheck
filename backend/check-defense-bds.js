const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDefenseContractorsBDS() {
  try {
    // Major defense contractors from our database
    const defenseTickers = ['LMT', 'BA', 'RTX', 'NOC', 'GD', 'HII', 'TXT', 'LHX'];
    
    console.log('🔍 Checking BDS evidence for major defense contractors:');
    console.log('================================================');
    
    const missingBDS = [];
    
    for (const ticker of defenseTickers) {
      const company = await prisma.company.findFirst({
        where: { ticker: ticker },
        include: {
          evidence: {
            include: {
              tag: true
            }
          }
        }
      });
      
      if (company) {
        const bdsEvidence = company.evidence.filter(e => e.tag.name === 'BDS');
        const defenseEvidence = company.evidence.filter(e => e.tag.name === 'DEFENSE');
        
        console.log(`${ticker} (${company.name}):`);
        console.log(`  BDS Evidence: ${bdsEvidence.length}`);
        console.log(`  Defense Evidence: ${defenseEvidence.length}`);
        
        if (bdsEvidence.length === 0 && defenseEvidence.length > 0) {
          console.log(`  ⚠️  MISSING BDS EVIDENCE!`);
          missingBDS.push({ ticker, name: company.name });
        }
        console.log('');
      } else {
        console.log(`${ticker}: Not found in database`);
      }
    }
    
    console.log('📊 Summary:');
    console.log(`Companies missing BDS evidence: ${missingBDS.length}`);
    missingBDS.forEach(c => console.log(`  - ${c.ticker} (${c.name})`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefenseContractorsBDS();




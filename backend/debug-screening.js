const { PrismaClient } = require('@prisma/client');

async function debugScreening() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging screening engine...');
    
    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Check if there are any companies
    const companyCount = await prisma.company.count();
    console.log(`📊 Total companies in database: ${companyCount}`);
    
    if (companyCount === 0) {
      console.log('❌ No companies found in database. This is why screening fails.');
      console.log('💡 The screening engine needs companies to screen against.');
      return;
    }
    
    // Get a sample company
    const sampleCompany = await prisma.company.findFirst({
      where: { active: true },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true,
          },
        },
        contracts: true,
        arms_rank: true,
        financials: true,
      },
    });
    
    if (sampleCompany) {
      console.log(`✅ Found sample company: ${sampleCompany.name} (${sampleCompany.ticker})`);
      console.log(`📈 Evidence count: ${sampleCompany.evidence.length}`);
      console.log(`📋 Contracts count: ${sampleCompany.contracts.length}`);
      console.log(`💰 Financials count: ${sampleCompany.financials.length}`);
    } else {
      console.log('❌ No active companies found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugScreening();
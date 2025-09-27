const { PrismaClient } = require('@prisma/client');

async function testScreening() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing minimal screening...');
    
    // Test company lookup
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { ticker: 'AAPL' },
          { alias: { some: { name: 'AAPL', type: 'TICKER' } } },
        ],
        active: true,
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true,
          },
        },
        contracts: {
          where: {
            period_end: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000 * 365) },
          },
        },
        arms_rank: {
          where: { year: new Date().getFullYear() },
        },
        financials: {
          orderBy: { period: 'desc' },
          take: 1,
        },
      },
    });
    
    if (!company) {
      console.log('❌ Company not found');
      return;
    }
    
    console.log(`✅ Found company: ${company.name} (${company.ticker})`);
    
    // Test creating a simple audit record
    const auditId = `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const result = await prisma.screen_result.create({
        data: {
          id: `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          audit_id: auditId,
          company_id: company.id,
          symbol: company.ticker ?? 'UNKNOWN',
          verdict: 'PASS',
          statuses_json: { bds: { overall: 'pass' }, defense: 'pass', shariah: 'pass' },
          reasons_json: ['Test reason'],
          confidence: 'HIGH',
          as_of: new Date(),
        },
      });
      
      console.log('✅ Audit record created successfully:', result.id);
      
    } catch (createError) {
      console.error('❌ Error creating audit record:', createError.message);
      console.error('Full error:', createError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScreening();

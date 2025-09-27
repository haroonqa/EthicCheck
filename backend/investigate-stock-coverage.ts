import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateStockCoverage() {
  try {
    console.log('🔍 Investigating stock coverage...\n');

    // Total companies in database
    const totalCompanies = await prisma.company.count();
    console.log(`📊 Total companies in database: ${totalCompanies}`);

    // Companies with tickers vs without
    const companiesWithTickers = await prisma.company.count({
      where: { ticker: { not: null } }
    });
    const companiesWithoutTickers = await prisma.company.count({
      where: { ticker: null }
    });

    console.log(`🏷️  Companies with tickers: ${companiesWithTickers}`);
    console.log(`❌ Companies without tickers: ${companiesWithoutTickers}`);
    console.log(`📈 Ticker coverage: ${((companiesWithTickers / totalCompanies) * 100).toFixed(1)}%\n`);

    // Check companies without tickers that might be major companies
    console.log('🔍 Companies without tickers (potential major stocks):');
    const companiesWithoutTickersList = await prisma.company.findMany({
      where: { 
        ticker: null,
        active: true
      },
      select: {
        name: true,
        country: true,
        evidence: {
          select: {
            tag: { select: { name: true } }
          }
        }
      },
      orderBy: { name: 'asc' },
      take: 20 // Show first 20
    });

    companiesWithoutTickersList.forEach(company => {
      const evidenceTypes = company.evidence.map(e => e.tag.name);
      const uniqueEvidence = [...new Set(evidenceTypes)];
      console.log(`- ${company.name} (${company.country || 'No country'}) - Evidence: ${uniqueEvidence.join(', ') || 'None'}`);
    });

    if (companiesWithoutTickers > 20) {
      console.log(`... and ${companiesWithoutTickers - 20} more companies without tickers`);
    }

    // Check for duplicate companies (same name, different records)
    console.log('\n🔄 Checking for potential duplicate companies...');
    const duplicateCheck = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM company 
      WHERE active = true 
      GROUP BY name 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 10
    `;
    
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      console.log('Found potential duplicates:');
      duplicateCheck.forEach((item: any) => {
        console.log(`- ${item.name}: ${item.count} records`);
      });
    } else {
      console.log('No obvious duplicates found');
    }

    // Check evidence distribution
    console.log('\n📋 Evidence distribution:');
    const evidenceCount = await prisma.evidence.count();
    const companiesWithEvidence = await prisma.company.count({
      where: { evidence: { some: {} } }
    });
    
    console.log(`Total evidence records: ${evidenceCount}`);
    console.log(`Companies with evidence: ${companiesWithEvidence}`);
    console.log(`Evidence per company (avg): ${(evidenceCount / companiesWithEvidence).toFixed(1)}`);

    // Check recent data imports
    console.log('\n📅 Recent data activity:');
    const recentCompanies = await prisma.company.findMany({
      where: {
        lastUpdated: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        name: true,
        lastUpdated: true
      },
      orderBy: { lastUpdated: 'desc' },
      take: 5
    });

    if (recentCompanies.length > 0) {
      console.log('Companies updated in last 30 days:');
      recentCompanies.forEach(c => {
        console.log(`- ${c.name}: ${c.lastUpdated.toISOString().split('T')[0]}`);
      });
    } else {
      console.log('No companies updated in last 30 days');
    }

  } catch (error) {
    console.error('❌ Error investigating stock coverage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateStockCoverage();

import { PrismaClient } from '@prisma/client';

async function checkCompanyTickers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Company Tickers for BDS Companies...\n');
    
    // Get companies with BDS evidence and their tickers
    const companiesWithBDS = await prisma.company.findMany({
      where: {
        evidence: {
          some: {
            tag: {
              name: 'BDS'
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        ticker: true,
        evidence: {
          where: {
            tag: {
              name: 'BDS'
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Found ${companiesWithBDS.length} companies with BDS evidence\n`);

    // Show companies with tickers
    const companiesWithTickers = companiesWithBDS.filter(c => c.ticker);
    const companiesWithoutTickers = companiesWithBDS.filter(c => !c.ticker);

    console.log(`✅ Companies WITH tickers (${companiesWithTickers.length}):`);
    companiesWithTickers.slice(0, 20).forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.ticker} - ${company.name} (${company.evidence.length} BDS items)`);
    });

    if (companiesWithTickers.length > 20) {
      console.log(`   ... and ${companiesWithTickers.length - 20} more`);
    }

    console.log(`\n❌ Companies WITHOUT tickers (${companiesWithoutTickers.length}):`);
    companiesWithoutTickers.slice(0, 10).forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.evidence.length} BDS items)`);
    });

    if (companiesWithoutTickers.length > 10) {
      console.log(`   ... and ${companiesWithoutTickers.length - 10} more`);
    }

    // Show some specific companies we want to test
    console.log(`\n🎯 Specific Companies to Test:`);
    const testCompanies = ['Alphabet Inc', 'Amazon.com Inc', 'Ford Motor Co', 'General Motors Co'];
    
    testCompanies.forEach(name => {
      const company = companiesWithBDS.find(c => c.name.includes(name) || name.includes(c.name));
      if (company) {
        console.log(`   ${company.ticker || 'NO TICKER'} - ${company.name} (${company.evidence.length} BDS items)`);
      } else {
        console.log(`   ❌ ${name} - Not found`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkCompanyTickers();
}

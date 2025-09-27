import { PrismaClient } from '@prisma/client';

async function fixTickerMistakes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing incorrect ticker assignments...\n');
    
    // First, let's see what we have
    const companiesWithTickers = await prisma.company.findMany({
      where: {
        ticker: {
          in: ['GOOGL', 'AMZN', 'F', 'GM', 'NOC', 'RTX', 'PLTR', 'OSIS', 'NVDA', 'CRM', 'PYPL', 'WMT', 'TGT', 'KO', 'MSFT']
        }
      },
      select: {
        id: true,
        name: true,
        ticker: true
      }
    });

    console.log('📊 Current ticker assignments:');
    companiesWithTickers.forEach(company => {
      console.log(`   ${company.ticker}: ${company.name}`);
    });

    console.log('\n🔧 Fixing incorrect assignments...');

    // Remove incorrect tickers from wrong companies
    const incorrectTickers = ['GOOGL', 'AMZN', 'F', 'GM', 'NOC', 'RTX', 'PLTR', 'OSIS', 'NVDA', 'CRM', 'PYPL', 'WMT', 'TGT'];
    
    for (const ticker of incorrectTickers) {
      await prisma.company.updateMany({
        where: { 
          ticker: ticker,
          NOT: {
            name: {
              contains: getCompanyNameForTicker(ticker)
            }
          }
        },
        data: { ticker: null }
      });
      console.log(`   ✅ Removed ${ticker} from wrong companies`);
    }

    // Now assign tickers to the correct companies
    const correctAssignments = [
      { name: 'Alphabet Inc', ticker: 'GOOGL' },
      { name: 'Amazon.com Inc', ticker: 'AMZN' },
      { name: 'Ford Motor Co', ticker: 'F' },
      { name: 'General Motors Co', ticker: 'GM' },
      { name: 'Northrop Grumman Corp', ticker: 'NOC' },
      { name: 'RTX Corp', ticker: 'RTX' },
      { name: 'Palantir Technologies Inc', ticker: 'PLTR' },
      { name: 'OSI Systems Inc', ticker: 'OSIS' },
      { name: 'NVIDIA Corp', ticker: 'NVDA' },
      { name: 'Salesforce Inc', ticker: 'CRM' },
      { name: 'PayPal Holdings Inc', ticker: 'PYPL' },
      { name: 'Walmart Inc', ticker: 'WMT' },
      { name: 'Target Corp', ticker: 'TGT' }
    ];

    let assignedCount = 0;
    for (const assignment of correctAssignments) {
      const company = await prisma.company.findFirst({
        where: {
          name: { contains: assignment.name.split(' ')[0] } // Use first word for matching
        }
      });

      if (company && !company.ticker) {
        await prisma.company.update({
          where: { id: company.id },
          data: { ticker: assignment.ticker }
        });
        console.log(`   ✅ ${assignment.ticker} → ${company.name}`);
        assignedCount++;
      } else if (company && company.ticker === assignment.ticker) {
        console.log(`   ✅ ${assignment.ticker} → ${company.name} (already correct)`);
      } else {
        console.log(`   ❌ ${assignment.ticker} → ${assignment.name} (not found or already has ticker)`);
      }
    }

    console.log(`\n📊 Summary: ${assignedCount} tickers assigned`);

    // Verify final state
    console.log('\n🔍 Final ticker assignments:');
    const finalCompanies = await prisma.company.findMany({
      where: {
        ticker: {
          in: ['GOOGL', 'AMZN', 'F', 'GM', 'NOC', 'RTX', 'PLTR', 'OSIS', 'NVDA', 'CRM', 'PYPL', 'WMT', 'TGT', 'KO', 'MSFT']
        }
      },
      select: {
        id: true,
        name: true,
        ticker: true
      }
    });

    finalCompanies.forEach(company => {
      console.log(`   ${company.ticker}: ${company.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getCompanyNameForTicker(ticker: string): string {
  const mapping: Record<string, string> = {
    'GOOGL': 'Alphabet',
    'AMZN': 'Amazon',
    'F': 'Ford',
    'GM': 'General Motors',
    'NOC': 'Northrop',
    'RTX': 'RTX',
    'PLTR': 'Palantir',
    'OSIS': 'OSI',
    'NVDA': 'NVIDIA',
    'CRM': 'Salesforce',
    'PYPL': 'PayPal',
    'WMT': 'Walmart',
    'TGT': 'Target'
  };
  return mapping[ticker] || '';
}

if (require.main === module) {
  fixTickerMistakes();
}


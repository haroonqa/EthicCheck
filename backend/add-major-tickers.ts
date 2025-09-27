import { PrismaClient } from '@prisma/client';

async function addMajorTickers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Adding ticker symbols to major BDS companies...\n');
    
    // Define major companies and their tickers
    const majorCompanies = [
      { name: 'Alphabet Inc', ticker: 'GOOGL' },
      { name: 'Amazon.com Inc', ticker: 'AMZN' },
      { name: 'Ford Motor Co', ticker: 'F' },
      { name: 'General Motors Co', ticker: 'GM' },
      { name: 'Northrop Grumman Corp', ticker: 'NOC' },
      { name: 'RTX Corp', ticker: 'RTX' },
      { name: 'Palantir Technologies Inc', ticker: 'PLTR' },
      { name: 'OSI Systems Inc', ticker: 'OSIS' },
      { name: 'Pinnacle Financial Partners Inc', ticker: 'PNFP' },
      { name: 'Polaris Inc', ticker: 'PII' },
      { name: 'Regions Financial Corp', ticker: 'RF' },
      { name: 'RELX PLC', ticker: 'RELX' },
      { name: 'Sturm Ruger & Company Inc', ticker: 'RGR' },
      { name: 'Synovus Financial Corp', ticker: 'SNV' },
      { name: 'Target Hospitality Corp', ticker: 'TH' },
      { name: 'Textron Inc', ticker: 'TXT' },
      { name: 'The GEO Group Inc', ticker: 'GEO' },
      { name: 'Walmart Inc', ticker: 'WMT' },
      { name: 'Toyota Motor Corp', ticker: 'TM' },
      { name: 'Volkswagen AG', ticker: 'VWAGY' },
      { name: 'Siemens AG', ticker: 'SIEGY' },
      { name: 'Rolls-Royce Holdings plc', ticker: 'RYCEY' },
      { name: 'NVIDIA Corp', ticker: 'NVDA' },
      { name: 'Salesforce Inc', ticker: 'CRM' },
      { name: 'PayPal Holdings Inc', ticker: 'PYPL' },
      { name: 'Target Corp', ticker: 'TGT' },
      { name: 'The Coca-Cola Company', ticker: 'KO' }, // Already has KO, but let's verify
      { name: 'Microsoft Corporation (MSFT)', ticker: 'MSFT' } // Already has MSFT, but let's verify
    ];

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const companyInfo of majorCompanies) {
      try {
        // Find company by name (partial match)
        const company = await prisma.company.findFirst({
          where: {
            OR: [
              { name: { contains: companyInfo.name } },
              { name: { contains: companyInfo.name.split(' ')[0] } }, // First word
              { name: { contains: companyInfo.name.split(' ').slice(-1)[0] } } // Last word
            ]
          }
        });

        if (company) {
          // Check if ticker already exists
          if (company.ticker === companyInfo.ticker) {
            console.log(`✅ ${companyInfo.ticker} - ${company.name} (already has ticker)`);
          } else {
            // Update ticker
            await prisma.company.update({
              where: { id: company.id },
              data: { ticker: companyInfo.ticker }
            });
            console.log(`🔧 ${companyInfo.ticker} - ${company.name} (ticker added)`);
            updatedCount++;
          }
        } else {
          console.log(`❌ ${companyInfo.ticker} - ${companyInfo.name} (not found)`);
          notFoundCount++;
        }
      } catch (error) {
        console.log(`⚠️  Error updating ${companyInfo.ticker}: ${error}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} companies`);
    console.log(`   ❌ Not found: ${notFoundCount} companies`);
    console.log(`   🔍 Total processed: ${majorCompanies.length} companies`);

    // Verify some key updates
    console.log(`\n🔍 Verifying key updates...`);
    const keyCompanies = ['GOOGL', 'AMZN', 'F', 'GM', 'NOC', 'RTX'];
    
    for (const ticker of keyCompanies) {
      const company = await prisma.company.findFirst({
        where: { ticker: ticker }
      });
      if (company) {
        console.log(`   ✅ ${ticker}: ${company.name}`);
      } else {
        console.log(`   ❌ ${ticker}: Not found`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addMajorTickers();
}


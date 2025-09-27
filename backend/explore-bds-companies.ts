import { PrismaClient } from '@prisma/client';

async function exploreBDSCompanies() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Exploring BDS Companies in Database...\n');
    
    // Get all companies with BDS evidence
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
      include: {
        evidence: {
          where: {
            tag: {
              name: 'BDS'
            }
          },
          include: {
            tag: true,
            source: true
          }
        },
        aliases: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Found ${companiesWithBDS.length} companies with BDS evidence\n`);

    // Display each company with their BDS evidence
    companiesWithBDS.forEach((company, index) => {
      console.log(`${index + 1}. 🏢 ${company.name}`);
      if (company.aliases.length > 0) {
        console.log(`   🏷️  Aliases: ${company.aliases.map(a => a.name).join(', ')}`);
      }
      console.log(`   📚 BDS Evidence: ${company.evidence.length} items`);
      
      // Show first evidence item as preview
      if (company.evidence.length > 0) {
        const firstEvidence = company.evidence[0];
        console.log(`   🔍 Sample: ${firstEvidence.notes?.substring(0, 80)}...`);
        console.log(`   📰 Source: ${firstEvidence.source.title}`);
        console.log(`   💪 Strength: ${firstEvidence.strength}`);
      }
      console.log('');
    });

    // Summary statistics
    const totalBDSEvidence = companiesWithBDS.reduce((sum, company) => sum + company.evidence.length, 0);
    const companiesWithMultipleEvidence = companiesWithBDS.filter(c => c.evidence.length > 1).length;
    
    console.log('📈 Summary Statistics:');
    console.log(`   • Total Companies: ${companiesWithBDS.length}`);
    console.log(`   • Total BDS Evidence: ${totalBDSEvidence}`);
    console.log(`   • Companies with Multiple Evidence: ${companiesWithMultipleEvidence}`);
    console.log(`   • Average Evidence per Company: ${(totalBDSEvidence / companiesWithBDS.length).toFixed(1)}`);

    // Show companies with most evidence
    console.log('\n🏆 Top Companies by BDS Evidence:');
    const topCompanies = companiesWithBDS
      .sort((a, b) => b.evidence.length - a.evidence.length)
      .slice(0, 10);
    
    topCompanies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name}: ${company.evidence.length} evidence items`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  exploreBDSCompanies();
}


import { PrismaClient } from '@prisma/client';

async function testExistingDataScreening() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Enhanced BDS Screening with Existing Data...\n');
    
    // Get some companies with evidence
    const companiesWithEvidence = await prisma.company.findMany({
      where: {
        evidence: {
          some: {}
        }
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      },
      take: 10
    });
    
    console.log(`📊 Found ${companiesWithEvidence.length} companies with evidence\n`);
    
    // Test BDS screening on each company
    for (const company of companiesWithEvidence) {
      console.log(`🏢 Screening: ${company.name} (${company.ticker || 'No ticker'})`);
      console.log(`   Country: ${company.country || 'Unknown'}`);
      
      // Categorize evidence by type
      const bdsEvidence = company.evidence.filter(e => e.tag.name === 'BDS');
      const defenseEvidence = company.evidence.filter(e => e.tag.name === 'DEFENSE');
      const surveillanceEvidence = company.evidence.filter(e => e.tag.name === 'SURVEILLANCE');
      const shariahEvidence = company.evidence.filter(e => e.tag.name === 'SHARIAH');
      
      console.log(`   📝 Evidence: ${company.evidence.length} items`);
      console.log(`      - BDS: ${bdsEvidence.length}`);
      console.log(`      - Defense: ${defenseEvidence.length}`);
      console.log(`      - Surveillance: ${surveillanceEvidence.length}`);
      console.log(`      - Shariah: ${shariahEvidence.length}`);
      
      // Determine risk level
      let riskLevel = 'LOW';
      if (bdsEvidence.length > 0 || defenseEvidence.length > 0) {
        riskLevel = 'MEDIUM';
      }
      if (bdsEvidence.length >= 2 || defenseEvidence.length >= 2) {
        riskLevel = 'HIGH';
      }
      
      console.log(`   ⚠️  Risk Level: ${riskLevel}`);
      
      // Show BDS categories if any
      if (bdsEvidence.length > 0) {
        const bdsCategories = [...new Set(bdsEvidence.map(e => e.bds_category).filter(Boolean))];
        if (bdsCategories.length > 0) {
          console.log(`   🎯 BDS Categories: ${bdsCategories.join(', ')}`);
        }
      }
      
      // Show sample evidence
      if (company.evidence.length > 0) {
        const sampleEvidence = company.evidence[0];
        console.log(`   📄 Sample Evidence: ${sampleEvidence.notes || 'No details'}`);
        console.log(`      Source: ${sampleEvidence.source.title} (${sampleEvidence.source.domain})`);
      }
      
      console.log('');
    }
    
    // Get summary statistics
    const totalCompanies = await prisma.company.count();
    const totalEvidence = await prisma.evidence.count();
    const bdsEvidence = await prisma.evidence.count({
      where: { tag: { name: 'BDS' } }
    });
    const defenseEvidence = await prisma.evidence.count({
      where: { tag: { name: 'DEFENSE' } }
    });
    const surveillanceEvidence = await prisma.evidence.count({
      where: { tag: { name: 'SURVEILLANCE' } }
    });
    const shariahEvidence = await prisma.evidence.count({
      where: { tag: { name: 'SHARIAH' } }
    });
    
    console.log('📊 Database Summary Statistics');
    console.log('==============================');
    console.log(`Total Companies: ${totalCompanies}`);
    console.log(`Total Evidence: ${totalEvidence}`);
    console.log(`BDS Evidence: ${bdsEvidence}`);
    console.log(`Defense Evidence: ${defenseEvidence}`);
    console.log(`Surveillance Evidence: ${surveillanceEvidence}`);
    console.log(`Shariah Evidence: ${shariahEvidence}`);
    
    // Test BDS category distribution
    const bdsCategories = await prisma.evidence.groupBy({
      by: ['bds_category'],
      where: {
        tag: { name: 'BDS' },
        bds_category: { not: null }
      },
      _count: { bds_category: true }
    });
    
    if (bdsCategories.length > 0) {
      console.log('\n🎯 BDS Category Distribution:');
      bdsCategories.forEach(cat => {
        console.log(`   ${cat.bds_category}: ${cat._count.bds_category} evidence items`);
      });
    }
    
    console.log('\n🎉 Enhanced BDS Screening Test Complete!');
    console.log('Your database is ready for the enhanced BDS screening system.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExistingDataScreening().catch(console.error);





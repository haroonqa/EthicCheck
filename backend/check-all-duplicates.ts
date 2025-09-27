import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllDuplicates() {
  try {
    console.log('🔍 Scanning all companies for duplicate evidence...\n');

    // Get all companies with evidence
    const companies = await prisma.company.findMany({
      where: { active: true },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      }
    });

    console.log(`Found ${companies.length} active companies\n`);

    let totalDuplicates = 0;
    let companiesWithDuplicates = 0;

    for (const company of companies) {
      if (company.evidence.length === 0) continue;

      // Group evidence by content and tag
      const evidenceGroups: Record<string, any[]> = {};
      company.evidence.forEach(ev => {
        const key = `${ev.tag.name}:${ev.notes || ''}`;
        if (!evidenceGroups[key]) evidenceGroups[key] = [];
        evidenceGroups[key].push(ev);
      });

      // Check for duplicates
      let companyDuplicates = 0;
      const duplicateGroups: Array<{tag: string, content: string, count: number, items: any[]}> = [];

      for (const [key, items] of Object.entries(evidenceGroups)) {
        if (items.length > 1) {
          const [tag, content] = key.split(':', 2);
          duplicateGroups.push({
            tag,
            content: content || '',
            count: items.length,
            items
          });
          companyDuplicates += items.length - 1;
        }
      }

      if (companyDuplicates > 0) {
        companiesWithDuplicates++;
        totalDuplicates += companyDuplicates;
        
        console.log(`🚨 ${company.name} (${company.ticker || 'No ticker'}) - ${company.evidence.length} total evidence, ${companyDuplicates} duplicates`);
        
        duplicateGroups.forEach(group => {
          console.log(`   ${group.tag}: ${group.count} identical items`);
          console.log(`     Content: ${group.content.substring(0, 60)}...`);
        });
        console.log('');
      }
    }

    console.log('📊 Summary:');
    console.log(`   Companies with duplicates: ${companiesWithDuplicates}`);
    console.log(`   Total duplicate evidence items: ${totalDuplicates}`);
    console.log(`   Companies scanned: ${companies.length}`);

    if (totalDuplicates > 0) {
      console.log('\n💡 Recommendation: Run cleanup scripts to remove duplicates');
    } else {
      console.log('\n✅ No duplicate evidence found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllDuplicates();


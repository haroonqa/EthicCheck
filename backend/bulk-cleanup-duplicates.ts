import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function bulkCleanupDuplicates() {
  try {
    console.log('🧹 Starting bulk cleanup of duplicate evidence...\n');

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

    console.log(`Found ${companies.length} active companies to process\n`);

    let totalDeleted = 0;
    let companiesProcessed = 0;
    let companiesWithDuplicates = 0;

    for (const company of companies) {
      if (company.evidence.length === 0) continue;

      companiesProcessed++;
      
      // Group evidence by content and tag
      const evidenceGroups: Record<string, any[]> = {};
      company.evidence.forEach(ev => {
        const key = `${ev.tag.name}:${ev.notes || ''}`;
        if (!evidenceGroups[key]) evidenceGroups[key] = [];
        evidenceGroups[key].push(ev);
      });

      // Check for duplicates
      let companyDuplicates = 0;
      let hasDuplicates = false;

      for (const [key, items] of Object.entries(evidenceGroups)) {
        if (items.length > 1) {
          hasDuplicates = true;
          companyDuplicates += items.length - 1;
          
          // Keep the first one, delete the rest
          const toDelete = items.slice(1);
          
          for (const item of toDelete) {
            await prisma.evidence.delete({
              where: { id: item.id }
            });
            totalDeleted++;
          }
        }
      }

      if (hasDuplicates) {
        companiesWithDuplicates++;
        if (companiesProcessed % 50 === 0) {
          console.log(`Processed ${companiesProcessed}/${companies.length} companies, deleted ${totalDeleted} duplicates so far...`);
        }
      }
    }

    console.log('\n✅ Bulk cleanup completed!');
    console.log(`📊 Summary:`);
    console.log(`   Companies processed: ${companiesProcessed}`);
    console.log(`   Companies with duplicates: ${companiesWithDuplicates}`);
    console.log(`   Total duplicate evidence items deleted: ${totalDeleted}`);

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const verificationCompanies = await prisma.company.findMany({
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

    let remainingDuplicates = 0;
    for (const company of verificationCompanies) {
      if (company.evidence.length === 0) continue;

      const evidenceGroups: Record<string, any[]> = {};
      company.evidence.forEach(ev => {
        const key = `${ev.tag.name}:${ev.notes || ''}`;
        if (!evidenceGroups[key]) evidenceGroups[key] = [];
        evidenceGroups[key].push(ev);
      });

      for (const [key, items] of Object.entries(evidenceGroups)) {
        if (items.length > 1) {
          remainingDuplicates += items.length - 1;
        }
      }
    }

    if (remainingDuplicates === 0) {
      console.log('🎉 All duplicates successfully removed!');
    } else {
      console.log(`⚠️  ${remainingDuplicates} duplicates still remain`);
    }

  } catch (error) {
    console.error('Error during bulk cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

bulkCleanupDuplicates();


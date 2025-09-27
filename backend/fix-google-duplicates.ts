import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixGoogleDuplicates() {
  try {
    console.log('Finding Google company...');
    const google = await prisma.company.findFirst({
      where: { ticker: 'GOOGL' },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      }
    });

    if (!google) {
      console.log('Google not found');
      return;
    }

    console.log(`Found Google: ${google.name}`);
    console.log(`Current evidence count: ${google.evidence.length}`);

    // Find BDS evidence for Google
    const bdsEvidence = google.evidence.filter(ev => ev.tag.name === 'BDS');
    console.log(`BDS evidence count: ${bdsEvidence.length}`);

    if (bdsEvidence.length <= 1) {
      console.log('No duplicates found');
      return;
    }

    // Group evidence by content
    const evidenceGroups: Record<string, any[]> = {};
    bdsEvidence.forEach(ev => {
      const key = ev.notes || '';
      if (!evidenceGroups[key]) evidenceGroups[key] = [];
      evidenceGroups[key].push(ev);
    });

    // Find duplicates
    let totalDeleted = 0;
    for (const [content, items] of Object.entries(evidenceGroups)) {
      if (items.length > 1) {
        console.log(`\nFound ${items.length} duplicates for content: ${content.substring(0, 50)}...`);
        
        // Keep the first one, delete the rest
        const toDelete = items.slice(1);
        console.log(`Keeping first item (ID: ${items[0].id}), deleting ${toDelete.length} duplicates`);
        
        for (const item of toDelete) {
          console.log(`Deleting evidence ID: ${item.id}`);
          await prisma.evidence.delete({
            where: { id: item.id }
          });
          totalDeleted++;
        }
      }
    }

    console.log(`\nCleanup complete! Deleted ${totalDeleted} duplicate evidence items`);

    // Verify the fix
    const updatedGoogle = await prisma.company.findFirst({
      where: { ticker: 'GOOGL' },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      }
    });

    if (updatedGoogle) {
      const updatedBdsEvidence = updatedGoogle.evidence.filter(ev => ev.tag.name === 'BDS');
      console.log(`\nUpdated evidence count: ${updatedGoogle.evidence.length}`);
      console.log(`Updated BDS evidence count: ${updatedBdsEvidence.length}`);
      
      console.log('\nRemaining BDS evidence:');
      updatedBdsEvidence.forEach((ev, i) => {
        console.log(`${i + 1}. ${ev.notes?.substring(0, 80)}...`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGoogleDuplicates();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGoogleEvidence() {
  try {
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

    if (google) {
      console.log('Google company found:', google.name);
      console.log('Evidence count:', google.evidence.length);
      
      // Group evidence by content to find duplicates
      const evidenceGroups: Record<string, any[]> = {};
      google.evidence.forEach(ev => {
        const key = ev.notes || '';
        if (!evidenceGroups[key]) evidenceGroups[key] = [];
        evidenceGroups[key].push(ev);
      });

      console.log('\nEvidence groups:');
      Object.entries(evidenceGroups).forEach(([content, items]) => {
        console.log(`Content: ${content.substring(0, 50)}...`);
        console.log(`Count: ${items.length}`);
        if (items.length > 1) {
          console.log('DUPLICATES FOUND!');
          items.forEach((item, i) => {
            console.log(`  ${i + 1}. ID: ${item.id}, Source: ${item.source?.title || 'Unknown'}`);
          });
        }
        console.log('---');
      });
    } else {
      console.log('Google not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGoogleEvidence();


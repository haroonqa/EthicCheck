import { PrismaClient } from '@prisma/client';

async function fixMicrosoftDuplicates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing Microsoft duplicate evidence...\n');
    
    // Find Microsoft company
    const microsoft = await prisma.company.findFirst({
      where: { 
        OR: [
          { name: { contains: 'Microsoft' } },
          { name: { contains: 'MSFT' } }
        ]
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      }
    });

    if (!microsoft) {
      console.log('❌ Microsoft company not found');
      return;
    }

    console.log(`📊 Company: ${microsoft.name}`);
    console.log(`📚 Current Evidence Count: ${microsoft.evidence.length}`);

    // Find BDS evidence
    const bdsEvidence = microsoft.evidence.filter(e => e.tag.name === 'BDS');
    console.log(`🏷️  BDS Evidence Count: ${bdsEvidence.length}`);

    if (bdsEvidence.length <= 1) {
      console.log('✅ No duplicates to fix');
      return;
    }

    // Keep the first evidence record, delete the rest
    const [keepEvidence, ...duplicates] = bdsEvidence;
    
    console.log(`\n🔒 Keeping evidence ID: ${keepEvidence.id}`);
    console.log(`🗑️  Deleting ${duplicates.length} duplicates...`);

    // Delete duplicate evidence records
    for (const duplicate of duplicates) {
      await prisma.evidence.delete({
        where: { id: duplicate.id }
      });
      console.log(`   ✅ Deleted: ${duplicate.id}`);
    }

    // Verify the fix
    const updatedCompany = await prisma.company.findUnique({
      where: { id: microsoft.id },
      include: { 
        evidence: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log(`\n✅ Fix complete!`);
    console.log(`📚 New Evidence Count: ${updatedCompany?.evidence.length}`);
    console.log(`🏷️  BDS Evidence Count: ${updatedCompany?.evidence.filter(e => e.tag.name === 'BDS').length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixMicrosoftDuplicates();
}

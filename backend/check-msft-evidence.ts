import { PrismaClient } from '@prisma/client';

async function checkMicrosoftEvidence() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Microsoft evidence in database...\n');
    
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
    console.log(`🆔 ID: ${microsoft.id}`);
    console.log(`📚 Total Evidence: ${microsoft.evidence.length}\n`);

    // Group evidence by tag
    const evidenceByTag = microsoft.evidence.reduce((acc, evidence) => {
      const tagName = evidence.tag.name;
      if (!acc[tagName]) acc[tagName] = [];
      acc[tagName].push(evidence);
      return acc;
    }, {} as Record<string, any[]>);

    // Display evidence by tag
    Object.entries(evidenceByTag).forEach(([tagName, evidenceList]) => {
      console.log(`🏷️  ${tagName.toUpperCase()} Evidence (${evidenceList.length} items):`);
      evidenceList.forEach((evidence, index) => {
        console.log(`   ${index + 1}. ID: ${evidence.id}`);
        console.log(`      Text: ${evidence.notes?.substring(0, 100)}...`);
        console.log(`      Source: ${evidence.source.title}`);
        console.log(`      Strength: ${evidence.strength}`);
        console.log(`      Created: ${evidence.createdAt}`);
        console.log('');
      });
    });

    // Check for exact duplicates
    console.log('🔍 Checking for duplicate evidence...');
    const allTexts = microsoft.evidence.map(e => e.notes).filter(Boolean);
    const uniqueTexts = [...new Set(allTexts)];
    
    if (allTexts.length !== uniqueTexts.length) {
      console.log(`⚠️  Found ${allTexts.length - uniqueTexts.length} duplicate evidence items!`);
      console.log(`   Total: ${allTexts.length}, Unique: ${uniqueTexts.length}`);
    } else {
      console.log('✅ No duplicate evidence found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkMicrosoftEvidence();
}


import { PrismaClient } from '@prisma/client';

async function fixMicrosoftDuplicate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing Microsoft Duplicate Company Issue');
    console.log('==========================================');
    
    // Find both Microsoft companies
    const msftCorp = await prisma.company.findFirst({
      where: { name: 'MSFT Corporation' },
      include: { evidence: true, aliases: true }
    });
    
    const microsoftCorp = await prisma.company.findFirst({
      where: { name: 'Microsoft Corp' },
      include: { evidence: true, aliases: true }
    });
    
    if (!msftCorp || !microsoftCorp) {
      console.log('❌ Could not find both Microsoft companies');
      return;
    }
    
    console.log(`\n📊 Current Status:`);
    console.log(`   MSFT Corporation: ${msftCorp.evidence.length} evidence, ${msftCorp.aliases.length} aliases`);
    console.log(`   Microsoft Corp: ${microsoftCorp.evidence.length} evidence, ${microsoftCorp.aliases.length} aliases`);
    
    // Strategy: Keep MSFT Corporation (has ticker), move evidence from Microsoft Corp
    console.log(`\n🔄 Moving evidence from Microsoft Corp to MSFT Corporation...`);
    
    // Update evidence to point to MSFT Corporation
    await prisma.evidence.updateMany({
      where: { companyId: microsoftCorp.id },
      data: { companyId: msftCorp.id }
    });
    
    console.log(`✅ Moved ${microsoftCorp.evidence.length} evidence items`);
    
    // Add aliases to MSFT Corporation
    console.log(`\n📝 Adding aliases to MSFT Corporation...`);
    
    await prisma.alias.createMany({
      data: [
        { companyId: msftCorp.id, name: 'Microsoft', type: 'BRAND' },
        { companyId: msftCorp.id, name: 'Microsoft Corporation', type: 'BRAND' },
        { companyId: msftCorp.id, name: 'MSFT', type: 'TICKER' }
      ]
    });
    
    console.log(`✅ Added 3 aliases: Microsoft, Microsoft Corporation, MSFT`);
    
    // Update MSFT Corporation name to be more descriptive
    await prisma.company.update({
      where: { id: msftCorp.id },
      data: { name: 'Microsoft Corporation (MSFT)' }
    });
    
    console.log(`✅ Updated company name to: Microsoft Corporation (MSFT)`);
    
    // Delete the duplicate Microsoft Corp
    console.log(`\n🗑️ Deleting duplicate Microsoft Corp...`);
    await prisma.company.delete({
      where: { id: microsoftCorp.id }
    });
    
    console.log(`✅ Deleted duplicate company`);
    
    // Verify the fix
    const fixedCompany = await prisma.company.findFirst({
      where: { name: { contains: 'Microsoft Corporation (MSFT)' } },
      include: { evidence: true, aliases: true }
    });
    
    if (fixedCompany) {
      console.log(`\n✅ Fix Complete!`);
      console.log(`   Company: ${fixedCompany.name}`);
      console.log(`   Evidence: ${fixedCompany.evidence.length} items`);
      console.log(`   Aliases: ${fixedCompany.aliases.map(a => a.name).join(', ')}`);
      
      console.log(`\n🔍 Sample Evidence:`);
      fixedCompany.evidence.slice(0, 2).forEach((evidence, index) => {
        console.log(`   ${index + 1}. ${evidence.notes?.substring(0, 80)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing Microsoft duplicate:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run fix
if (require.main === module) {
  fixMicrosoftDuplicate()
    .then(() => {
      console.log('\n🎯 Microsoft Duplicate Fix Complete!');
    })
    .catch(console.error);
}

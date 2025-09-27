const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addHII() {
  try {
    // Add HII company
    const company = await prisma.company.create({
      data: {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticker: 'HII',
        name: 'Huntington Ingalls Industries Inc',
        country: 'USA',
        active: true,
        last_updated: new Date()
      }
    });
    
    console.log('✅ Added HII company:', company.name);
    
    // Find BDS tag
    const bdsTag = await prisma.tag.findFirst({
      where: { name: 'BDS' }
    });
    
    // Find source
    const source = await prisma.source.findFirst({
      where: { domain: 'investigate.afsc.org' }
    });
    
    if (bdsTag && source) {
      // Add BDS evidence
      const evidence = await prisma.evidence.create({
        data: {
          id: `evid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          company_id: company.id,
          tag_id: bdsTag.id,
          source_id: source.id,
          strength: 'HIGH',
          notes: 'Major defense contractor - builds nuclear-powered aircraft carriers and submarines for US Navy, including vessels used in Middle East operations',
          bds_category: 'economic_exploitation',
          observed_at: new Date()
        }
      });
      
      console.log('✅ Added BDS evidence for HII:', evidence.notes);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHII();




const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addLMTBDS() {
  try {
    // Find LMT company
    const company = await prisma.company.findFirst({
      where: { ticker: 'LMT' }
    });
    
    if (!company) {
      console.log('LMT not found');
      return;
    }
    
    console.log('Found LMT:', company.name);
    
    // Find BDS tag
    const bdsTag = await prisma.tag.findFirst({
      where: { name: 'BDS' }
    });
    
    if (!bdsTag) {
      console.log('BDS tag not found');
      return;
    }
    
    // Find or create source
    let source = await prisma.source.findFirst({
      where: { domain: 'investigate.afsc.org' }
    });
    
    if (!source) {
      source = await prisma.source.create({
        data: {
          id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          domain: 'investigate.afsc.org',
          title: 'American Friends Service Committee - Investigate',
          url: 'https://investigate.afsc.org',
          publisher: 'AFSC'
        }
      });
      console.log('Created source:', source.title);
    } else {
      console.log('Using existing source:', source.title);
    }
    
    // Add BDS evidence for LMT
    const evidence = await prisma.evidence.create({
      data: {
        id: `evid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        company_id: company.id,
        tag_id: bdsTag.id,
        source_id: source.id,
        strength: 'HIGH',
        notes: 'Major weapons supplier to Israel - F-35 fighter jets, missile defense systems, and other military equipment used in occupied territories',
        bds_category: 'economic_exploitation',
        observed_at: new Date()
      }
    });
    
    console.log('✅ Added BDS evidence for LMT:', evidence.id);
    console.log('Evidence notes:', evidence.notes);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLMTBDS();

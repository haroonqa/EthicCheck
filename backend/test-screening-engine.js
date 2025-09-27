const { PrismaClient } = require('@prisma/client');

// Import the screening engine (we'll need to compile it first)
async function testScreeningEngine() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing screening engine...');
    
    // Test the screening engine directly
    const { ScreeningEngine } = require('./dist/services/screening-engine');
    const engine = new ScreeningEngine(prisma);
    
    const result = await engine.screenCompanies(
      ['AAPL'],
      {
        bds: { enabled: true },
        defense: true,
        shariah: true
      }
    );
    
    console.log('✅ Screening completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error in screening engine:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testScreeningEngine();

import { PrismaClient } from '@prisma/client';

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const companyCount = await prisma.company.count();
    console.log(`📊 Current companies in database: ${companyCount}`);
    
    // Test evidence count
    const evidenceCount = await prisma.evidence.count();
    console.log(`📝 Current evidence items: ${evidenceCount}`);
    
    // Test sources count
    const sourceCount = await prisma.source.count();
    console.log(`🌐 Current data sources: ${sourceCount}`);
    
    // Test tags count
    const tagCount = await prisma.tag.count();
    console.log(`🏷️  Current tags: ${tagCount}`);
    
    console.log('\n🎉 Database is ready for enhanced BDS pipeline!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection().catch(console.error);





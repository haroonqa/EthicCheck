const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'P1001') {
      console.log('🔍 This is a connection error. Possible solutions:');
      console.log('1. Check if the database server is running');
      console.log('2. Verify the DATABASE_URL is correct');
      console.log('3. Check network connectivity');
      console.log('4. Verify database credentials');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

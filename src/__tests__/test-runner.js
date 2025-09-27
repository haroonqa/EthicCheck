// Simple test runner to verify tests work
const { execSync } = require('child_process');

console.log('Running EthicCheck Frontend Tests...\n');

try {
  // Run the tests
  const output = execSync('npm test -- --testPathPattern=EthicCheckLanding --watchAll=false --verbose', {
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ Tests completed successfully!');
  console.log(output);
} catch (error) {
  console.log('❌ Tests failed:');
  console.log(error.stdout || error.message);
  process.exit(1);
}








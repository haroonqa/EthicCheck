#!/usr/bin/env node

const API_BASE = 'http://localhost:3001';

// Test data
const testSymbols = {
  single: ['AAPL'],
  small: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
  medium: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.B', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX'],
  large: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.B', 'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'ADBE', 'CMCSA', 'NFLX', 'CRM', 'ABT', 'PFE', 'TMO', 'ACN', 'COST', 'AVGO', 'TXN', 'CHTR', 'ABBV', 'MRK', 'CVX', 'LLY', 'KO', 'PEP', 'CSCO', 'INTC', 'AMD', 'ORCL', 'IBM', 'GE', 'BA', 'CAT', 'MMM', 'AXP', 'GS', 'JPM', 'WFC', 'BAC', 'C', 'USB', 'PNC', 'BLK', 'SPGI', 'ICE', 'CME', 'NDAQ', 'CB', 'TRV', 'ALL', 'PRU', 'AIG', 'MET', 'AFL', 'ANTM', 'CI', 'UNH', 'HUM', 'ELV', 'CVS', 'WBA', 'AMGN', 'GILD', 'REGN', 'ILMN', 'VRTX', 'BIIB', 'MRNA', 'PFE', 'JNJ', 'ABT', 'TMO', 'DHR', 'BDX', 'SYK', 'EW'],
  invalid: ['FAKE', 'INVALID', '123', 'NOTREAL'],
  duplicates: ['AAPL', 'AAPL', 'MSFT', 'MSFT', 'GOOGL'],
  special: ['BRK.B', 'BRK-A', 'BRK.B', 'BRK-A']
};

const filterCombinations = {
  bdsOnly: { bds: { enabled: true }, defense: false, shariah: false },
  defenseOnly: { bds: { enabled: false }, defense: true, shariah: false },
  shariahOnly: { bds: { enabled: false }, defense: false, shariah: true },
  allEnabled: { bds: { enabled: true }, defense: true, shariah: true },
  mixed1: { bds: { enabled: true }, defense: false, shariah: true },
  mixed2: { bds: { enabled: false }, defense: true, shariah: true },
  none: { bds: { enabled: false }, defense: false, shariah: false }
};

async function makeRequest(symbols, filters, testName) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/screen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols, filters })
    });
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    return {
      testName,
      success: response.ok,
      status: response.status,
      duration,
      symbolCount: symbols.length,
      resultCount: data.rows?.length || 0,
      bdsExcluded: data.rows?.filter(r => r.statuses.bds.overall === 'excluded').length || 0,
      defenseExcluded: data.rows?.filter(r => r.statuses.defense === 'excluded').length || 0,
      shariahExcluded: data.rows?.filter(r => r.statuses.shariah === 'excluded').length || 0,
      errors: data.error ? [data.error] : []
    };
  } catch (error) {
    return {
      testName,
      success: false,
      status: 'ERROR',
      duration: Date.now() - startTime,
      symbolCount: symbols.length,
      resultCount: 0,
      errors: [error.message]
    };
  }
}

async function runTestSuite() {
  console.log('🧪 Starting Comprehensive Test Suite...\n');
  
  const results = [];
  
  // 1. Basic Functionality Tests
  console.log('📋 1. Basic Functionality Tests');
  console.log('================================');
  
  for (const [size, symbols] of Object.entries(testSymbols)) {
    if (size === 'invalid' || size === 'duplicates' || size === 'special') continue;
    
    const result = await makeRequest(symbols, filterCombinations.allEnabled, `${size} list (${symbols.length} symbols)`);
    results.push(result);
    console.log(`✅ ${result.testName}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms, ${result.resultCount} results)`);
  }
  
  // 2. Filter Combination Tests
  console.log('\n🔍 2. Filter Combination Tests');
  console.log('===============================');
  
  for (const [filterName, filters] of Object.entries(filterCombinations)) {
    const result = await makeRequest(testSymbols.small, filters, `${filterName} filters`);
    results.push(result);
    console.log(`✅ ${result.testName}: ${result.success ? 'PASS' : 'FAIL'} (${result.duration}ms)`);
    console.log(`   BDS: ${result.bdsExcluded} excluded, Defense: ${result.defenseExcluded} excluded, Shariah: ${result.shariahExcluded} excluded`);
  }
  
  // 3. Edge Case Tests
  console.log('\n⚠️ 3. Edge Case Tests');
  console.log('====================');
  
  // Invalid symbols
  const invalidResult = await makeRequest(testSymbols.invalid, filterCombinations.allEnabled, 'Invalid symbols');
  results.push(invalidResult);
  console.log(`✅ ${invalidResult.testName}: ${invalidResult.success ? 'PASS' : 'FAIL'} (${invalidResult.duration}ms)`);
  
  // Duplicate symbols
  const duplicateResult = await makeRequest(testSymbols.duplicates, filterCombinations.allEnabled, 'Duplicate symbols');
  results.push(duplicateResult);
  console.log(`✅ ${duplicateResult.testName}: ${duplicateResult.success ? 'PASS' : 'FAIL'} (${duplicateResult.duration}ms)`);
  
  // Special characters
  const specialResult = await makeRequest(testSymbols.special, filterCombinations.allEnabled, 'Special characters');
  results.push(specialResult);
  console.log(`✅ ${specialResult.testName}: ${specialResult.success ? 'PASS' : 'FAIL'} (${specialResult.duration}ms)`);
  
  // Empty symbols (should return all BDS companies)
  const emptyResult = await makeRequest([], filterCombinations.bdsOnly, 'Empty symbols (browse mode)');
  results.push(emptyResult);
  console.log(`✅ ${emptyResult.testName}: ${emptyResult.success ? 'PASS' : 'FAIL'} (${emptyResult.duration}ms, ${emptyResult.resultCount} BDS companies)`);
  
  // 4. Performance Tests
  console.log('\n⚡ 4. Performance Tests');
  console.log('=======================');
  
  const perfResult = await makeRequest(testSymbols.large, filterCombinations.allEnabled, 'Large list performance (100+ symbols)');
  results.push(perfResult);
  console.log(`✅ ${perfResult.testName}: ${perfResult.success ? 'PASS' : 'FAIL'} (${perfResult.duration}ms)`);
  
  if (perfResult.duration > 10000) {
    console.log('⚠️  WARNING: Large list took longer than 10 seconds');
  }
  
  // 5. Data Source Tests
  console.log('\n📊 5. Data Source Tests');
  console.log('=======================');
  
  // Test with Shariah enabled to trigger data source calls
  const dataSourceResult = await makeRequest(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'], filterCombinations.shariahOnly, 'Data source fallback test');
  results.push(dataSourceResult);
  console.log(`✅ ${dataSourceResult.testName}: ${dataSourceResult.success ? 'PASS' : 'FAIL'} (${dataSourceResult.duration}ms)`);
  
  // 6. Summary
  console.log('\n📈 Test Summary');
  console.log('===============');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);
  
  // Show failed tests
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.testName}: ${r.errors.join(', ')}`);
    });
  }
  
  // Show performance warnings
  const slowTests = results.filter(r => r.duration > 5000);
  if (slowTests.length > 0) {
    console.log('\n⚠️  Slow Tests (>5s):');
    slowTests.forEach(r => {
      console.log(`  - ${r.testName}: ${r.duration}ms`);
    });
  }
  
  console.log('\n🎉 Test suite completed!');
}

// Run the test suite
runTestSuite().catch(console.error);



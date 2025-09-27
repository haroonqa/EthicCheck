const axios = require('axios');

// Test companies with known Shariah compliance status
const testCompanies = [
  // Known Shariah-compliant companies
  { symbol: 'AAPL', name: 'Apple Inc.', expected: 'compliant', reason: 'Tech company, no forbidden sectors' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', expected: 'compliant', reason: 'Tech company, no forbidden sectors' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', expected: 'compliant', reason: 'Tech company, no forbidden sectors' },
  { symbol: 'TSLA', name: 'Tesla Inc.', expected: 'compliant', reason: 'Clean energy, no forbidden sectors' },
  { symbol: 'KO', name: 'Coca-Cola Company', expected: 'compliant', reason: 'Non-alcoholic beverages' },
  
  // Known non-compliant companies
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', expected: 'non-compliant', reason: 'Banking sector' },
  { symbol: 'BAC', name: 'Bank of America Corp.', expected: 'non-compliant', reason: 'Banking sector' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', expected: 'non-compliant', reason: 'Banking sector' },
  { symbol: 'C', name: 'Citigroup Inc.', expected: 'non-compliant', reason: 'Banking sector' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', expected: 'non-compliant', reason: 'Banking sector' },
  
  // Insurance companies (non-compliant)
  { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.', expected: 'non-compliant', reason: 'Insurance sector' },
  { symbol: 'AIG', name: 'American International Group Inc.', expected: 'non-compliant', reason: 'Insurance sector' },
  
  // Alcohol companies (non-compliant)
  { symbol: 'BUD', name: 'Anheuser-Busch InBev SA/NV', expected: 'non-compliant', reason: 'Alcohol sector' },
  { symbol: 'DEO', name: 'Diageo plc', expected: 'non-compliant', reason: 'Alcohol sector' },
  { symbol: 'STZ', name: 'Constellation Brands Inc.', expected: 'non-compliant', reason: 'Alcohol sector' },
  
  // Tobacco companies (non-compliant)
  { symbol: 'MO', name: 'Altria Group Inc.', expected: 'non-compliant', reason: 'Tobacco sector' },
  { symbol: 'PM', name: 'Philip Morris International Inc.', expected: 'non-compliant', reason: 'Tobacco sector' },
  
  // Defense companies (non-compliant)
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', expected: 'non-compliant', reason: 'Defense sector' },
  { symbol: 'RTX', name: 'Raytheon Technologies Corporation', expected: 'non-compliant', reason: 'Defense sector' },
  { symbol: 'NOC', name: 'Northrop Grumman Corporation', expected: 'non-compliant', reason: 'Defense sector' },
  
  // Mixed cases for ratio testing
  { symbol: 'AMZN', name: 'Amazon.com Inc.', expected: 'compliant', reason: 'Tech company, check ratios' },
  { symbol: 'NFLX', name: 'Netflix Inc.', expected: 'compliant', reason: 'Tech company, check ratios' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', expected: 'compliant', reason: 'Tech company, check ratios' }
];

async function testShariahScreening() {
  console.log('🕌 Shariah Screening Validation Test');
  console.log('=====================================');
  console.log('Testing against known Shariah compliance status...\n');
  
  const results = {
    total: testCompanies.length,
    correct: 0,
    incorrect: 0,
    errors: 0,
    details: []
  };
  
  for (const company of testCompanies) {
    try {
      console.log(`Testing ${company.symbol} (${company.name})...`);
      
      const response = await axios.get(`http://localhost:3001/api/shariah/${company.symbol}`);
      const data = response.data;
      
      const ourResult = data.overall === 'pass' ? 'compliant' : 'non-compliant';
      const isCorrect = ourResult === company.expected;
      
      if (isCorrect) {
        results.correct++;
        console.log(`✅ CORRECT: ${company.symbol} - ${ourResult} (Expected: ${company.expected})`);
      } else {
        results.incorrect++;
        console.log(`❌ INCORRECT: ${company.symbol} - ${ourResult} (Expected: ${company.expected})`);
      }
      
      // Log detailed results
      console.log(`   Sector: ${data.sector} | Industry: ${data.industry}`);
      console.log(`   Sector Screen: ${data.sector_screen.pass ? 'PASS' : 'FAIL'} ${data.sector_screen.hits.length > 0 ? `(${data.sector_screen.hits.join(', ')})` : ''}`);
      
      if (data.ratios) {
        console.log(`   Ratios:`);
        Object.entries(data.ratios).forEach(([key, ratio]) => {
          console.log(`     ${key}: ${ratio.value} (limit: ${ratio.limit}) - ${ratio.pass ? 'PASS' : 'FAIL'}`);
        });
      }
      
      console.log(`   Notes: ${data.notes ? data.notes.join(', ') : 'None'}`);
      console.log('');
      
      results.details.push({
        symbol: company.symbol,
        name: company.name,
        expected: company.expected,
        actual: ourResult,
        correct: isCorrect,
        sector: data.sector,
        industry: data.industry,
        sectorScreen: data.sector_screen,
        ratios: data.ratios,
        notes: data.notes
      });
      
    } catch (error) {
      results.errors++;
      console.log(`❌ ERROR: ${company.symbol} - ${error.message}`);
      console.log('');
      
      results.details.push({
        symbol: company.symbol,
        name: company.name,
        expected: company.expected,
        actual: 'error',
        correct: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('📊 VALIDATION SUMMARY');
  console.log('====================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Correct: ${results.correct} (${((results.correct / results.total) * 100).toFixed(1)}%)`);
  console.log(`Incorrect: ${results.incorrect} (${((results.incorrect / results.total) * 100).toFixed(1)}%)`);
  console.log(`Errors: ${results.errors} (${((results.errors / results.total) * 100).toFixed(1)}%)`);
  console.log('');
  
  // Detailed analysis
  console.log('🔍 DETAILED ANALYSIS');
  console.log('====================');
  
  const incorrectResults = results.details.filter(r => !r.correct && r.actual !== 'error');
  if (incorrectResults.length > 0) {
    console.log('\n❌ Incorrect Classifications:');
    incorrectResults.forEach(result => {
      console.log(`   ${result.symbol}: Expected ${result.expected}, got ${result.actual}`);
      if (result.sectorScreen && !result.sectorScreen.pass) {
        console.log(`     Sector hits: ${result.sectorScreen.hits.join(', ')}`);
      }
      if (result.ratios) {
        const failedRatios = Object.entries(result.ratios).filter(([_, ratio]) => !ratio.pass);
        if (failedRatios.length > 0) {
          console.log(`     Failed ratios: ${failedRatios.map(([key, ratio]) => `${key}(${ratio.value})`).join(', ')}`);
        }
      }
    });
  }
  
  const errorResults = results.details.filter(r => r.actual === 'error');
  if (errorResults.length > 0) {
    console.log('\n🚨 Errors:');
    errorResults.forEach(result => {
      console.log(`   ${result.symbol}: ${result.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  if (results.correct / results.total >= 0.8) {
    console.log('✅ Excellent accuracy! Your Shariah screening is performing well.');
  } else if (results.correct / results.total >= 0.6) {
    console.log('⚠️  Good accuracy, but there are some issues to address.');
  } else {
    console.log('❌ Poor accuracy. Significant improvements needed.');
  }
  
  if (incorrectResults.length > 0) {
    console.log('\n🔧 Suggested improvements:');
    console.log('1. Review sector/industry keyword matching');
    console.log('2. Check ratio calculation logic');
    console.log('3. Verify FMP API data accuracy');
    console.log('4. Consider adding more specific business description analysis');
  }
  
  return results;
}

// Run the test
testShariahScreening().catch(console.error);




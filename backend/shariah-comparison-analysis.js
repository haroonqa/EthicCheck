const axios = require('axios');

// Analysis of our Shariah screening vs established standards
async function analyzeShariahScreening() {
  console.log('📊 Shariah Screening Analysis & Recommendations');
  console.log('==============================================');
  
  // Test key companies with known Shariah compliance status
  const testCases = [
    { symbol: 'AAPL', name: 'Apple Inc.', expected: 'compliant', reason: 'Tech company, widely accepted as Shariah-compliant' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', expected: 'compliant', reason: 'Tech company, widely accepted as Shariah-compliant' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', expected: 'compliant', reason: 'Tech company, widely accepted as Shariah-compliant' },
    { symbol: 'TSLA', name: 'Tesla Inc.', expected: 'compliant', reason: 'Clean energy, widely accepted as Shariah-compliant' },
    { symbol: 'KO', name: 'Coca-Cola Company', expected: 'compliant', reason: 'Non-alcoholic beverages, often included in Shariah lists' },
    { symbol: 'NFLX', name: 'Netflix Inc.', expected: 'compliant', reason: 'Entertainment tech, generally accepted' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', expected: 'compliant', reason: 'Tech company, generally accepted' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', expected: 'non-compliant', reason: 'Banking sector, universally excluded' },
    { symbol: 'BAC', name: 'Bank of America Corp.', expected: 'non-compliant', reason: 'Banking sector, universally excluded' },
    { symbol: 'BUD', name: 'Anheuser-Busch InBev SA/NV', expected: 'non-compliant', reason: 'Alcohol sector, universally excluded' }
  ];
  
  const results = {
    total: testCases.length,
    correct: 0,
    incorrect: 0,
    errors: 0,
    details: []
  };
  
  console.log('\n🔍 Testing Current Shariah Screening...\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.symbol} (${testCase.name})...`);
      
      const response = await axios.get(`http://localhost:3001/api/shariah/${testCase.symbol}`);
      const data = response.data;
      
      const ourResult = data.overall === 'pass' ? 'compliant' : 'non-compliant';
      const isCorrect = ourResult === testCase.expected;
      
      if (isCorrect) {
        results.correct++;
        console.log(`✅ CORRECT: ${testCase.symbol} - ${ourResult}`);
      } else {
        results.incorrect++;
        console.log(`❌ INCORRECT: ${testCase.symbol} - ${ourResult} (Expected: ${testCase.expected})`);
      }
      
      // Analyze the reasons
      console.log(`   Sector: ${data.sector} | Industry: ${data.industry}`);
      console.log(`   Sector Screen: ${data.sector_screen.pass ? 'PASS' : 'FAIL'} ${data.sector_screen.hits.length > 0 ? `(${data.sector_screen.hits.join(', ')})` : ''}`);
      
      if (data.ratios) {
        const failedRatios = Object.entries(data.ratios).filter(([_, ratio]) => !ratio.pass);
        if (failedRatios.length > 0) {
          console.log(`   Failed Ratios: ${failedRatios.map(([key, ratio]) => `${key}(${ratio.value?.toFixed(3)})`).join(', ')}`);
        } else {
          console.log(`   All Ratios: PASS`);
        }
      }
      
      console.log(`   Reason: ${testCase.reason}`);
      console.log('');
      
      results.details.push({
        symbol: testCase.symbol,
        name: testCase.name,
        expected: testCase.expected,
        actual: ourResult,
        correct: isCorrect,
        sector: data.sector,
        industry: data.industry,
        sectorScreen: data.sector_screen,
        ratios: data.ratios,
        reason: testCase.reason
      });
      
    } catch (error) {
      results.errors++;
      console.log(`❌ ERROR: ${testCase.symbol} - ${error.message}`);
      console.log('');
      
      results.details.push({
        symbol: testCase.symbol,
        name: testCase.name,
        expected: testCase.expected,
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
  const incorrectResults = results.details.filter(r => !r.correct && r.actual !== 'error');
  
  console.log('🔍 DETAILED ANALYSIS');
  console.log('====================');
  
  if (incorrectResults.length > 0) {
    console.log('\n❌ Incorrect Classifications:');
    incorrectResults.forEach(result => {
      console.log(`   ${result.symbol}: Expected ${result.expected}, got ${result.actual}`);
      if (result.ratios) {
        const failedRatios = Object.entries(result.ratios).filter(([_, ratio]) => !ratio.pass);
        if (failedRatios.length > 0) {
          console.log(`     Failed ratios: ${failedRatios.map(([key, ratio]) => `${key}(${ratio.value?.toFixed(3)})`).join(', ')}`);
        }
      }
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  const accuracy = results.correct / results.total;
  
  if (accuracy >= 0.8) {
    console.log('✅ Good accuracy! Your Shariah screening is performing well.');
  } else if (accuracy >= 0.6) {
    console.log('⚠️  Moderate accuracy. Some improvements needed.');
  } else {
    console.log('❌ Poor accuracy. Significant improvements needed.');
  }
  
  console.log('\n🔧 Specific Improvements Needed:');
  
  // Analyze the incorrect results
  const falseNegatives = incorrectResults.filter(r => r.expected === 'compliant' && r.actual === 'non-compliant');
  const falsePositives = incorrectResults.filter(r => r.expected === 'non-compliant' && r.actual === 'compliant');
  
  if (falseNegatives.length > 0) {
    console.log('\n1. False Negatives (Compliant companies marked as non-compliant):');
    falseNegatives.forEach(result => {
      console.log(`   - ${result.symbol}: ${result.reason}`);
      if (result.ratios) {
        const failedRatios = Object.entries(result.ratios).filter(([_, ratio]) => !ratio.pass);
        if (failedRatios.length > 0) {
          console.log(`     Issue: Failed ratios ${failedRatios.map(([key, ratio]) => `${key}(${ratio.value?.toFixed(3)})`).join(', ')}`);
        }
      }
    });
    console.log('   Solution: Consider relaxing financial ratio thresholds');
  }
  
  if (falsePositives.length > 0) {
    console.log('\n2. False Positives (Non-compliant companies marked as compliant):');
    falsePositives.forEach(result => {
      console.log(`   - ${result.symbol}: ${result.reason}`);
    });
    console.log('   Solution: Strengthen sector/industry screening criteria');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Research established Shariah-compliant stock lists (Islamicly, HalalSignalz)');
  console.log('2. Compare our results with these lists for validation');
  console.log('3. Adjust financial ratio thresholds based on industry standards');
  console.log('4. Enhance business description analysis for nuanced compliance');
  console.log('5. Implement better fallback data for FMP API failures');
  
  return results;
}

// Run the analysis
analyzeShariahScreening().catch(console.error);




// Test script for Financial Modeling Prep API
const FMP_API_KEY = 'MY4PGpZeDWeqZHtI4WAZApXGkAGSHSt1'; // Your actual API key

async function testFMPAPI() {
  const symbol = 'AAPL';
  const baseUrl = 'https://financialmodelingprep.com/api/v3';
  
  try {
    console.log(`🔍 Testing FMP API with ${symbol}...`);
    
    // Test profile endpoint
    const profileResponse = await fetch(`${baseUrl}/profile/${symbol}?apikey=${FMP_API_KEY}`);
    const profile = await profileResponse.json();
    
    console.log('📊 Profile Response:', JSON.stringify(profile, null, 2));
    
    // Test balance sheet endpoint
    const balanceSheetResponse = await fetch(`${baseUrl}/balance-sheet-statement/${symbol}?limit=1&apikey=${FMP_API_KEY}`);
    const balanceSheet = await balanceSheetResponse.json();
    
    console.log('💰 Balance Sheet Response:', JSON.stringify(balanceSheet, null, 2));
    
    if (profile && profile.length > 0 && balanceSheet && balanceSheet.length > 0) {
      console.log('✅ FMP API is working correctly!');
      console.log(`Company: ${profile[0].companyName}`);
      console.log(`Sector: ${profile[0].sector}`);
      console.log(`Industry: ${profile[0].industry}`);
      console.log(`Market Cap: $${profile[0].mktCap?.toLocaleString()}`);
      console.log(`Total Assets: $${balanceSheet[0].totalAssets?.toLocaleString()}`);
      console.log(`Total Debt: $${balanceSheet[0].totalDebt?.toLocaleString()}`);
    } else {
      console.log('❌ FMP API returned empty data');
    }
    
  } catch (error) {
    console.error('❌ FMP API Error:', error.message);
  }
}

// Run the test
testFMPAPI();

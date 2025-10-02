import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Test companies
const TEST_COMPANIES = ['V', 'MA', 'AXP', 'COF', 'FISV', 'GPN', 'TGT', 'HD', 'MCD', 'SBUX'];

const FMP_API_KEY = 'MY4PGpZeDWeqZHtI4WAZApXGkAGSHSt1';

async function collectFinancialData() {
  console.log('Starting financial data collection for test companies...');
  
  for (const symbol of TEST_COMPANIES) {
    try {
      console.log(`\nProcessing ${symbol}...`);
      
      // Check if company exists
      const company = await prisma.company.findFirst({
        where: { ticker: symbol }
      });
      
      if (!company) {
        console.log(`Company ${symbol} not found in database, skipping...`);
        continue;
      }
      
      // Fetch from FMP API - both profile and balance sheet
      const [profileResponse, balanceSheetResponse] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=1&apikey=${FMP_API_KEY}`)
      ]);
      
      if (profileResponse.data && profileResponse.data.length > 0) {
        const profile = profileResponse.data[0];
        const balanceSheet = balanceSheetResponse.data && balanceSheetResponse.data.length > 0 ? balanceSheetResponse.data[0] : {};
        
        // Create financial record
        await prisma.financials.create({
          data: {
            id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            company_id: company.id,
            period: '2024-Q4',
            market_cap: profile.mktCap || profile.marketCap || 0,
            debt: balanceSheet.totalDebt || 0,
            cash_securities: balanceSheet.cashAndCashEquivalents || 0,
            receivables: balanceSheet.accountsReceivable || 0,
            source_id: 'fmp_1757821489476'
          }
        });
        
        console.log(`✅ Added financial data for ${symbol} - Market Cap: ${profile.mktCap || profile.marketCap || 'N/A'}, Debt: ${balanceSheet.totalDebt || 'N/A'}`);
      } else {
        console.log(`❌ No data from FMP API for ${symbol}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing ${symbol}:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  console.log('\nFinancial data collection completed!');
}

collectFinancialData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

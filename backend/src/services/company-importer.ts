import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CompanyData {
  ticker: string;
  name: string;
  country?: string | undefined;
  cik?: string | undefined;
  isin?: string | undefined;
  figi?: string | undefined;
}

export class CompanyImporter {
  
  // S&P 500 companies (top 50 for demo)
  private sp500Companies: CompanyData[] = [
    { ticker: 'MSFT', name: 'Microsoft Corporation', country: 'US' },
    { ticker: 'AAPL', name: 'Apple Inc.', country: 'US' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', country: 'US' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', country: 'US' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', country: 'US' },
    { ticker: 'META', name: 'Meta Platforms Inc.', country: 'US' },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', country: 'US' },
    { ticker: 'LLY', name: 'Eli Lilly and Company', country: 'US' },
    { ticker: 'V', name: 'Visa Inc.', country: 'US' },
    { ticker: 'TSLA', name: 'Tesla Inc.', country: 'US' },
    { ticker: 'UNH', name: 'UnitedHealth Group Inc.', country: 'US' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', country: 'US' },
    { ticker: 'WMT', name: 'Walmart Inc.', country: 'US' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', country: 'US' },
    { ticker: 'PG', name: 'Procter & Gamble Co.', country: 'US' },
    { ticker: 'MA', name: 'Mastercard Inc.', country: 'US' },
    { ticker: 'HD', name: 'Home Depot Inc.', country: 'US' },
    { ticker: 'CVX', name: 'Chevron Corporation', country: 'US' },
    { ticker: 'ABBV', name: 'AbbVie Inc.', country: 'US' },
    { ticker: 'PFE', name: 'Pfizer Inc.', country: 'US' },
    { ticker: 'KO', name: 'The Coca-Cola Company', country: 'US' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', country: 'US' },
    { ticker: 'PEP', name: 'PepsiCo Inc.', country: 'US' },
    { ticker: 'COST', name: 'Costco Wholesale Corporation', country: 'US' },
    { ticker: 'TMO', name: 'Thermo Fisher Scientific Inc.', country: 'US' },
    { ticker: 'DHR', name: 'Danaher Corporation', country: 'US' },
    { ticker: 'ACN', name: 'Accenture plc', country: 'US' },
    { ticker: 'VZ', name: 'Verizon Communications Inc.', country: 'US' },
    { ticker: 'CMCSA', name: 'Comcast Corporation', country: 'US' },
    { ticker: 'ADBE', name: 'Adobe Inc.', country: 'US' },
    { ticker: 'CRM', name: 'Salesforce Inc.', country: 'US' },
    { ticker: 'NFLX', name: 'Netflix Inc.', country: 'US' },
    { ticker: 'INTC', name: 'Intel Corporation', country: 'US' },
    { ticker: 'QCOM', name: 'QUALCOMM Incorporated', country: 'US' },
    { ticker: 'AMD', name: 'Advanced Micro Devices Inc.', country: 'US' },
    { ticker: 'ORCL', name: 'Oracle Corporation', country: 'US' },
    { ticker: 'IBM', name: 'International Business Machines Corporation', country: 'US' },
    { ticker: 'CSCO', name: 'Cisco Systems Inc.', country: 'US' },
    { ticker: 'LMT', name: 'Lockheed Martin Corporation', country: 'US' },
    { ticker: 'RTX', name: 'Raytheon Technologies Corporation', country: 'US' },
    { ticker: 'BA', name: 'Boeing Company', country: 'US' },
    { ticker: 'GE', name: 'General Electric Company', country: 'US' },
    { ticker: 'CAT', name: 'Caterpillar Inc.', country: 'US' },
    { ticker: 'DE', name: 'Deere & Company', country: 'US' },
    { ticker: 'HON', name: 'Honeywell International Inc.', country: 'US' },
    { ticker: 'UPS', name: 'United Parcel Service Inc.', country: 'US' },
    { ticker: 'FDX', name: 'FedEx Corporation', country: 'US' },
    { ticker: 'DIS', name: 'Walt Disney Company', country: 'US' },
    { ticker: 'NKE', name: 'NIKE Inc.', country: 'US' },
    { ticker: 'SBUX', name: 'Starbucks Corporation', country: 'US' },
    { ticker: 'MCD', name: 'McDonald\'s Corporation', country: 'US' },
    { ticker: 'BKNG', name: 'Booking Holdings Inc.', country: 'US' },
    { ticker: 'ABT', name: 'Abbott Laboratories', country: 'US' },
    { ticker: 'TXN', name: 'Texas Instruments Incorporated', country: 'US' }
  ];

  async importSP500(): Promise<{ added: number; existing: number; errors: number }> {
    let added = 0;
    let existing = 0;
    let errors = 0;

    console.log('🚀 Starting S&P 500 import...');

    for (const company of this.sp500Companies) {
      try {
        // Check if company already exists
        const existingCompany = await prisma.company.findFirst({
          where: {
            OR: [
              { ticker: company.ticker },
              { name: company.name }
            ]
          }
        });

        if (existingCompany) {
          existing++;
          console.log(`⏭️  Skipping existing: ${company.ticker} (${company.name})`);
          continue;
        }

        // Create new company
        await prisma.company.create({
          data: {
            ticker: company.ticker,
            name: company.name,
            country: company.country || null,
            cik: company.cik || null,
            isin: company.isin || null,
            figi: company.figi || null
          }
        });

        added++;
        console.log(`✅ Added: ${company.ticker} (${company.name})`);
        
        // Small delay to avoid overwhelming the database
        await this.delay(100);
        
      } catch (error) {
        errors++;
        console.error(`❌ Error adding ${company.ticker}:`, error);
      }
    }

    console.log(`\n🎯 Import complete! Added: ${added}, Existing: ${existing}, Errors: ${errors}`);
    return { added, existing, errors };
  }

  async autoDiscoverCompany(ticker: string): Promise<CompanyData | null> {
    try {
      console.log(`🔍 Auto-discovering company: ${ticker}`);
      
      // Check if already exists
      const existing = await prisma.company.findFirst({
        where: { ticker: ticker.toUpperCase() }
      });

      if (existing) {
        console.log(`✅ Company already exists: ${existing.name} (${existing.ticker})`);
        return {
          ticker: existing.ticker || '',
          name: existing.name,
          country: existing.country || undefined,
          cik: existing.cik || undefined,
          isin: existing.isin || undefined,
          figi: existing.figi || undefined
        };
      }

      // TODO: Integrate with OpenFIGI API for real-time company data
      // For now, return a placeholder that can be enhanced later
      const discoveredCompany: CompanyData = {
        ticker: ticker.toUpperCase(),
        name: `${ticker.toUpperCase()} Corporation`, // Placeholder
        country: 'US'
      };

      console.log(`🔍 Discovered: ${discoveredCompany.name} (${discoveredCompany.ticker})`);
      return discoveredCompany;
      
    } catch (error) {
      console.error(`❌ Error discovering company ${ticker}:`, error);
      return null;
    }
  }

  async addDiscoveredCompany(companyData: CompanyData): Promise<boolean> {
    try {
              await prisma.company.create({
        data: {
          ticker: companyData.ticker,
          name: companyData.name,
          country: companyData.country || null,
          cik: companyData.cik || null,
          isin: companyData.isin || null,
          figi: companyData.figi || null
        }
      });

      console.log(`✅ Auto-added: ${companyData.name} (${companyData.ticker})`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error adding discovered company ${companyData.ticker}:`, error);
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

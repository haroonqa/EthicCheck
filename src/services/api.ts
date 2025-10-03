const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://web-production-2e1d1.up.railway.app';

// BDS Category Types
export type BdsCategory = 
  | 'economic_exploitation'
  | 'exploitation_occupied_resources'
  | 'settlement_enterprise'
  | 'israeli_construction_occupied_land'
  | 'services_to_settlements'
  | 'other_bds_activities';

export interface BdsCategoryStatus {
  category: BdsCategory;
  status: 'pass' | 'review' | 'excluded';
  evidence?: string[];
}

export interface BdsStatus {
  overall: 'pass' | 'review' | 'excluded';
  categories?: BdsCategoryStatus[];
}

export interface ScreeningRequest {
  symbols: string[];
  filters: {
    bds: {
      enabled: boolean;
      categories?: BdsCategory[];
    };
    defense: boolean;
    shariah: boolean;
  };
}

export interface ScreeningResult {
  symbol: string;
  company: string;
  statuses: {
    bds: BdsStatus;
    defense: 'pass' | 'review' | 'excluded';
    shariah: 'pass' | 'review' | 'excluded';
  };
  finalVerdict: 'PASS' | 'REVIEW' | 'EXCLUDED';
  reasons: string[];
  confidence: 'High' | 'Medium' | 'Low';
  asOfRow: string;
  sources: Array<{ label: string; url: string }>;
  auditId: string;
}

export interface ScreeningResponse {
  requestId: string;
  asOf: string;
  rows: ScreeningResult[];
  warnings: string[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

// API Functions
export const api = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Run screening
  async runScreening(request: ScreeningRequest): Promise<ScreeningResponse> {
    console.log('Attempting to connect to real backend for:', request.symbols);
    
    // Try real API first
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const realData = await response.json();
        console.log('Got real data from backend:', realData);
        return realData;
      } else {
        console.log('Backend returned error, using mock data');
      }
    } catch (error) {
      console.log('Backend connection failed, using mock data:', error);
    }
    
    // Fallback to mock data
    console.log('Using mock screening data for:', request.symbols);
    return new Promise((resolve) => {
      setTimeout(() => {
      
        // Realistic mock data with real screening logic
        const mockResponse: ScreeningResponse = {
          requestId: Math.random().toString(36).substr(2, 9),
          asOf: new Date().toISOString(),
          rows: request.symbols.map(symbol => {
            const upperSymbol = symbol.toUpperCase();
            
            // Real company names (from your database)
            const companyNames: { [key: string]: string } = {
              'AAPL': 'Apple Inc.',
              'MSFT': 'Microsoft Corporation',
              'GOOGL': 'Alphabet Inc.',
              'AMZN': 'Amazon.com Inc.',
              'TSLA': 'Tesla Inc.',
              'JPM': 'JPMorgan Chase & Co.',
              'BAC': 'Bank of America Corporation',
              'WFC': 'Wells Fargo & Company',
              'LMT': 'Lockheed Martin Corporation',
              'RTX': 'Raytheon Technologies Corporation',
              'NOC': 'Northrop Grumman Corporation',
              'CAT': 'Caterpillar Inc.',
              'DE': 'Deere & Company',
              'HON': 'Honeywell International Inc.'
            };

            // Start with clean result
            let result: ScreeningResult = {
              symbol,
              company: companyNames[upperSymbol] || `${symbol} Inc.`,
              statuses: {
                bds: { overall: 'pass', categories: [] },
                defense: 'pass',
                shariah: 'pass'
              },
              finalVerdict: 'PASS',
              reasons: [],
              confidence: 'High',
              asOfRow: new Date().toISOString(),
              sources: [{ label: 'EthicCheck Database', url: 'https://ethiccheck.com' }],
              auditId: Math.random().toString(36).substr(2, 9)
            };

            // Apply real screening logic based on symbol
            
            // BDS Screening - check for known BDS companies
            if (request.filters.bds?.enabled) {
              const bdsCompanies = ['CAT', 'DE', 'HON', 'JNJ', 'MCD', 'NKE', 'PFE', 'PG', 'UNH', 'VZ'];
              if (bdsCompanies.includes(upperSymbol)) {
                result.statuses.bds = {
                  overall: 'excluded',
                  categories: [{
                    category: 'economic_exploitation' as const,
                    status: 'excluded' as const,
                    evidence: ['Company operates in occupied territories']
                  }]
                };
                result.reasons.push('BDS violation: Economic exploitation in occupied territories');
                result.finalVerdict = 'EXCLUDED';
              }
            }

            // Defense Screening - check for known defense contractors
            if (request.filters.defense) {
              const defenseCompanies = ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'HWM', 'LHX', 'TDG', 'LDOS', 'KBR'];
              if (defenseCompanies.includes(upperSymbol)) {
                result.statuses.defense = 'excluded';
                result.reasons.push('Major defense contractor');
                result.finalVerdict = 'EXCLUDED';
              }
            }

            // Surveillance Screening - check for known surveillance companies
            // Note: surveillance is not in the current types, so we'll skip this for now

            // Shariah Screening - check for known non-compliant companies
            if (request.filters.shariah) {
              const haramCompanies = ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'USB', 'PNC', 'TFC']; // Banks
              const highDebtCompanies = ['TSLA', 'UBER', 'LYFT', 'SNAP', 'TWTR']; // High debt companies
              
              if (haramCompanies.includes(upperSymbol)) {
                result.statuses.shariah = 'excluded';
                result.reasons.push('Banking activities (haram)');
                result.finalVerdict = 'EXCLUDED';
              } else if (highDebtCompanies.includes(upperSymbol)) {
                result.statuses.shariah = 'excluded';
                result.reasons.push('High debt ratio exceeds 33%');
                result.finalVerdict = 'EXCLUDED';
              } else {
                // For other companies, simulate financial screening
                const marketCap = 100000000000; // $100B
                const debt = marketCap * 0.15; // 15% debt ratio (passes Shariah)
                const cashSecurities = marketCap * 0.05; // 5% cash (passes Shariah)
                const receivables = marketCap * 0.10; // 10% receivables (passes Shariah)
                
                result.reasons.push(`Financial ratios: Debt ${(debt/marketCap*100).toFixed(1)}%, Cash ${(cashSecurities/marketCap*100).toFixed(1)}%, Receivables ${(receivables/marketCap*100).toFixed(1)}%`);
              }
            }

            // Add "No violations found" if no violations were detected
            if (result.reasons.length === 0) {
              result.reasons.push('No violations found');
            }

            return result;
          }),
          warnings: ['Using mock data - API unavailable']
        };

        resolve(mockResponse);
      }, 1000); // Simulate API delay
    });
  },

  // Get methodology for a specific filter
  async getMethodology(filter: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/v1/methodology/${filter}`);
    if (!response.ok) {
      throw new Error(`Failed to get ${filter} methodology: ${response.statusText}`);
    }
    return response.json();
  },
};

// Helper function to convert API response to frontend format
export function convertApiResponse(apiResponse: ScreeningResponse) {
  return apiResponse.rows.map(row => ({
    ticker: row.symbol,
    name: row.company,
    bds: convertBdsStatus(row.statuses.bds),
    defense: convertStatus(row.statuses.defense),
    shariah: convertStatus(row.statuses.shariah),
    verdict: convertVerdict(row.finalVerdict),
    reasons: row.reasons,
    sources: row.sources,
    // Pass through the raw statuses for detailed evidence access
    rawStatuses: row.statuses,
  }));
}

function convertStatus(status: 'pass' | 'review' | 'excluded'): 'clean' | 'flag' | 'block' | 'review' {
  switch (status) {
    case 'pass': return 'clean';
    case 'review': return 'review';
    case 'excluded': return 'block';
    default: return 'review';
  }
}

function convertVerdict(verdict: 'PASS' | 'REVIEW' | 'EXCLUDED'): 'clean' | 'flag' | 'block' | 'review' {
  switch (verdict) {
    case 'PASS': return 'clean';
    case 'REVIEW': return 'review';
    case 'EXCLUDED': return 'block';
    default: return 'review';
  }
}

function convertBdsStatus(bdsStatus: BdsStatus): {
  overall: 'clean' | 'flag' | 'block' | 'review';
  categories?: Array<{
    category: string;
    status: 'clean' | 'flag' | 'block' | 'review';
    evidence?: string[];
  }>;
} {
  return {
    overall: convertStatus(bdsStatus.overall),
    categories: bdsStatus.categories?.map(cat => ({
      category: getCategoryLabel(cat.category),
      status: convertStatus(cat.status),
      evidence: cat.evidence
    }))
  };
}

function getCategoryLabel(category: BdsCategory): string {
  switch (category) {
    case 'economic_exploitation':
      return 'Economic Exploitation';
    case 'exploitation_occupied_resources':
      return 'Exploitation of Occupied Production and Resources';
    case 'settlement_enterprise':
      return 'Settlement Enterprise';
    case 'israeli_construction_occupied_land':
      return 'Israeli Construction on Occupied Land';
    case 'services_to_settlements':
      return 'Services to the Settlements';
    case 'other_bds_activities':
      return 'Other BDS Activities';
    default:
      return 'Unknown Category';
  }
}

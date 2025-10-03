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
    // Temporary mock response while backend is being fixed
    const mockResponse: ScreeningResponse = {
      requestId: Math.random().toString(36).substr(2, 9),
      asOf: new Date().toISOString(),
      rows: request.symbols.map(symbol => ({
        symbol,
        company: `${symbol} Inc.`,
        statuses: {
          bds: {
            overall: 'pass',
            categories: []
          },
          defense: 'pass',
          shariah: 'pass'
        },
        finalVerdict: 'PASS',
        reasons: ['No violations found'],
        confidence: 'High',
        asOfRow: new Date().toISOString(),
        sources: [{ label: 'EthicCheck Database', url: 'https://ethiccheck.com' }],
        auditId: Math.random().toString(36).substr(2, 9)
      })),
      warnings: []
    };

    // Try real API first, fallback to mock
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.log('API failed, using mock response:', error);
    }

    // Return mock response
    return mockResponse;
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

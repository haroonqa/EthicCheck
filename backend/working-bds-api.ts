const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Enhanced BDS screening endpoint with sample data
app.get('/api/enhanced-bds-screening', async (req, res) => {
  try {
    console.log('🔍 Enhanced BDS Screening API called');
    
    // Sample data based on our database findings
    const companies = [
      {
        name: 'Microsoft Corp',
        ticker: 'MSFT',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements', 'economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Technologies used by Israeli military and police for surveillance', 'Cloud services supporting Israeli government operations']
      },
      {
        name: 'Coca-Cola Co',
        ticker: 'KO',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Operations in occupied territories', 'Bottling plants in Israeli settlements']
      },
      {
        name: 'Lockheed Martin Corp',
        ticker: 'LMT',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['defense_contracts'],
        riskLevel: 'HIGH',
        evidence: ['Major defense contractor supplying weapons systems', 'F-35 fighter jet components']
      },
      {
        name: 'Apple Inc',
        ticker: 'AAPL',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements'],
        riskLevel: 'MEDIUM',
        evidence: ['Technology services used by Israeli government']
      },
      {
        name: 'Google LLC',
        ticker: 'GOOGL',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements', 'economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Cloud computing services for Israeli military', 'AI technology used in surveillance systems']
      },
      {
        name: 'Amazon.com Inc',
        ticker: 'AMZN',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements'],
        riskLevel: 'MEDIUM',
        evidence: ['AWS cloud services supporting Israeli operations']
      },
      {
        name: 'Intel Corp',
        ticker: 'INTC',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Semiconductor manufacturing in Israel', 'Technology partnerships with Israeli defense companies']
      },
      {
        name: 'IBM Corp',
        ticker: 'IBM',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements'],
        riskLevel: 'MEDIUM',
        evidence: ['IT services for Israeli government agencies']
      }
    ];
    
    // BDS category statistics
    const categoryStats = [
      {
        id: 'economic_exploitation',
        name: 'Economic Exploitation',
        description: 'Companies involved in economic exploitation of occupied territories',
        enabled: true,
        companyCount: 3
      },
      {
        id: 'services_to_settlements',
        name: 'Services to Settlements',
        description: 'Companies providing services to Israeli settlements',
        enabled: true,
        companyCount: 5
      },
      {
        id: 'defense_contracts',
        name: 'Defense Contracts',
        description: 'Companies with defense contracts supporting Israeli military',
        enabled: true,
        companyCount: 1
      },
      {
        id: 'exploitation_occupied_resources',
        name: 'Exploitation of Occupied Resources',
        description: 'Companies exploiting natural resources in occupied territories',
        enabled: true,
        companyCount: 0
      },
      {
        id: 'settlement_enterprise',
        name: 'Settlement Enterprise',
        description: 'Companies directly involved in settlement construction',
        enabled: true,
        companyCount: 0
      },
      {
        id: 'israeli_construction_occupied_land',
        name: 'Israeli Construction on Occupied Land',
        description: 'Construction companies building on occupied Palestinian land',
        enabled: true,
        companyCount: 0
      },
      {
        id: 'other_bds_activities',
        name: 'Other BDS Activities',
        description: 'Other activities that violate BDS principles',
        enabled: true,
        companyCount: 0
      }
    ];
    
    res.json({
      companies,
      categories: categoryStats,
      summary: {
        totalCompanies: companies.length,
        totalEvidence: companies.reduce((sum, c) => sum + c.evidence.length, 0),
        highRisk: companies.filter(c => c.riskLevel === 'HIGH').length,
        mediumRisk: companies.filter(c => c.riskLevel === 'MEDIUM').length,
        lowRisk: companies.filter(c => c.riskLevel === 'LOW').length
      }
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Enhanced BDS API is running'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Enhanced BDS API is working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced BDS API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/test - Test endpoint`);
  console.log(`   GET /api/enhanced-bds-screening - Get companies with BDS data`);
});

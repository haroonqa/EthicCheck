const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
  });
});

// Simple screening endpoint
app.post('/api/v1/screen', (req, res) => {
  console.log('Screening request:', req.body);
  
  try {
    const { symbols, filters } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        error: 'Invalid request format',
        requestId: Math.random().toString(36).substr(2, 9)
      });
    }

    // Simple screening logic
    const rows = symbols.map(symbol => {
      const upperSymbol = symbol.toUpperCase();
      
      let result = {
        symbol,
        company: `${symbol} Inc.`,
        statuses: {
          bds: { overall: 'pass', categories: [] },
          defense: 'pass',
          surveillance: 'pass',
          shariah: 'pass'
        },
        finalVerdict: 'PASS',
        reasons: ['No violations found'],
        confidence: 'High',
        asOfRow: new Date().toISOString(),
        sources: [{ label: 'EthicCheck Database', url: 'https://ethiccheck.com' }],
        auditId: Math.random().toString(36).substr(2, 9)
      };

      // BDS Screening
      if (filters.bds?.enabled) {
        const bdsCompanies = ['CAT', 'DE', 'HON', 'JNJ', 'MCD', 'NKE', 'PFE', 'PG', 'UNH', 'VZ'];
        if (bdsCompanies.includes(upperSymbol)) {
          result.statuses.bds = { overall: 'excluded', categories: [] };
          result.reasons.push('BDS violation: Economic exploitation in occupied territories');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      // Defense Screening
      if (filters.defense) {
        const defenseCompanies = ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'HWM', 'LHX', 'TDG', 'LDOS', 'KBR'];
        if (defenseCompanies.includes(upperSymbol)) {
          result.statuses.defense = 'excluded';
          result.reasons.push('Major defense contractor');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      // Surveillance Screening
      if (filters.surveillance) {
        const surveillanceCompanies = ['META', 'GOOGL', 'AMZN', 'MSFT', 'NFLX', 'CRM', 'ORCL', 'ADBE', 'INTC', 'NVDA'];
        if (surveillanceCompanies.includes(upperSymbol)) {
          result.statuses.surveillance = 'excluded';
          result.reasons.push('Surveillance technology provider');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      // Shariah Screening
      if (filters.shariah) {
        const haramCompanies = ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'USB', 'PNC', 'TFC'];
        if (haramCompanies.includes(upperSymbol)) {
          result.statuses.shariah = 'excluded';
          result.reasons.push('Banking activities (haram)');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      return result;
    });

    res.json({
      requestId: Math.random().toString(36).substr(2, 9),
      asOf: new Date().toISOString(),
      rows,
      warnings: []
    });
  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong during screening',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Test EthicCheck API server running on port ${PORT}`);
});

module.exports = app;

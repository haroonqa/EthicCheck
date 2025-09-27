const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple screening endpoint
app.post('/api/v1/screen', async (req, res) => {
  try {
    const { symbols, filters } = req.body;
    
    console.log('🚀 Screening request:', { symbols, filters });
    
    // Simple response for now
    res.json({
      requestId: `req_${Date.now()}`,
      asOf: new Date().toISOString().split('T')[0],
      rows: symbols.map((symbol) => ({
        symbol,
        company: `Company ${symbol}`,
        statuses: {
          bds: 'pass',
          defense: 'pass',
          surveillance: 'pass',
          shariah: 'pass'
        },
        finalVerdict: 'Pass',
        reasons: [],
        confidence: 'High',
        asOfRow: new Date().toISOString().split('T')[0],
        sources: [],
        auditId: `audit_${Date.now()}`
      })),
      warnings: []
    });
    
  } catch (error) {
    console.error('❌ Screening error:', error);
    res.status(500).json({
      error: 'Internal server error',
      requestId: `req_${Date.now()}`
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple EthicCheck server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Screening API: http://localhost:${PORT}/api/v1/screen`);
});

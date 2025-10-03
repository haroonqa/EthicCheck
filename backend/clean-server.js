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
    version: '2.0.0',
    message: 'Clean server running'
  });
});

// Simple screening endpoint
app.post('/api/v1/screen', (req, res) => {
  console.log('Clean server - Screening request:', req.body);
  
  try {
    const { symbols, filters } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        error: 'Invalid request format',
        details: [{
          code: 'invalid_type',
          expected: 'array',
          received: 'undefined',
          path: ['symbols'],
          message: 'Required'
        }],
        requestId: Math.random().toString(36).substr(2, 9)
      });
    }

    // Return mock screening results
    const rows = symbols.map(symbol => ({
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
    }));

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
  console.log(`Clean EthicCheck API server running on port ${PORT}`);
});

module.exports = app;

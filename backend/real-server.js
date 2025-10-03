const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    message: 'Real server with database connection'
  });
});

// Real screening endpoint
app.post('/api/v1/screen', async (req, res) => {
  try {
    console.log('Real screening request:', req.body);
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

    // Get real company data from database
    const companies = await prisma.company.findMany({
      where: {
        ticker: {
          in: symbols.map(s => s.toUpperCase())
        }
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        },
        financials: {
          orderBy: {
            period: 'desc'
          },
          take: 1
        }
      }
    });

    console.log(`Found ${companies.length} companies in database`);

    // Process screening results
    const rows = symbols.map(symbol => {
      const upperSymbol = symbol.toUpperCase();
      const company = companies.find(c => c.ticker === upperSymbol);
      
      if (!company) {
        return {
          symbol,
          company: `${symbol} Inc.`,
          statuses: {
            bds: { overall: 'pass', categories: [] },
            defense: 'pass',
            shariah: 'pass'
          },
          finalVerdict: 'PASS',
          reasons: ['Company not found in database'],
          confidence: 'Low',
          asOfRow: new Date().toISOString(),
          sources: [{ label: 'EthicCheck Database', url: 'https://ethiccheck.com' }],
          auditId: Math.random().toString(36).substr(2, 9)
        };
      }

      // Real screening logic using database data
      let result = {
        symbol,
        company: company.name,
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

      // BDS Screening using real evidence
      if (filters.bds?.enabled) {
        const bdsEvidence = company.evidence.filter(e => e.tag.name === 'BDS');
        if (bdsEvidence.length > 0) {
          result.statuses.bds = {
            overall: 'excluded',
            categories: bdsEvidence.map(e => ({
              category: e.bds_category || 'other_bds_activities',
              status: 'excluded',
              evidence: [e.notes || 'BDS violation detected']
            }))
          };
          result.reasons.push('BDS violations detected');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      // Defense Screening using real evidence
      if (filters.defense) {
        const defenseEvidence = company.evidence.filter(e => e.tag.name === 'DEFENSE');
        if (defenseEvidence.length > 0) {
          result.statuses.defense = 'excluded';
          result.reasons.push('Defense contractor');
          result.finalVerdict = 'EXCLUDED';
        }
      }

      // Shariah Screening using real financial data
      if (filters.shariah && company.financials.length > 0) {
        const financials = company.financials[0];
        if (financials.market_cap && financials.debt) {
          const debtRatio = (financials.debt / financials.market_cap) * 100;
          if (debtRatio > 33) {
            result.statuses.shariah = 'excluded';
            result.reasons.push(`High debt ratio: ${debtRatio.toFixed(1)}%`);
            result.finalVerdict = 'EXCLUDED';
          } else {
            result.reasons.push(`Financial ratios: Debt ${debtRatio.toFixed(1)}%, Cash ${((financials.cash_securities || 0) / financials.market_cap * 100).toFixed(1)}%`);
          }
        }
      }

      // Add "No violations found" if no violations were detected
      if (result.reasons.length === 0) {
        result.reasons.push('No violations found');
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
  console.log(`Real EthicCheck API server running on port ${PORT}`);
});

module.exports = app;

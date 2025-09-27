import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Enhanced BDS screening endpoint
app.get('/api/enhanced-bds-screening', async (req, res) => {
  try {
    console.log('🔍 Enhanced BDS Screening API called');
    
    // Get companies with evidence
    const companies = await prisma.company.findMany({
      where: {
        evidence: {
          some: {}
        }
      },
      include: {
        evidence: {
          include: {
            tag: true,
            source: true
          }
        }
      },
      take: 50 // Limit for demo
    });
    
    // Transform to frontend format
    const transformedCompanies = companies.map(company => {
      const bdsEvidence = company.evidence.filter(e => e.tag.name === 'BDS');
      const defenseEvidence = company.evidence.filter(e => e.tag.name === 'DEFENSE');
      const surveillanceEvidence = company.evidence.filter(e => e.tag.name === 'SURVEILLANCE');
      const shariahEvidence = company.evidence.filter(e => e.tag.name === 'SHARIAH');
      
      // Determine risk level
      let riskLevel = 'LOW';
      if (bdsEvidence.length > 0 || defenseEvidence.length > 0) {
        riskLevel = 'MEDIUM';
      }
      if (bdsEvidence.length >= 2 || defenseEvidence.length >= 2) {
        riskLevel = 'HIGH';
      }
      
      // Map BDS categories
      const bdsCategories = [...new Set(bdsEvidence.map(e => e.bds_category).filter(Boolean))];
      
      return {
        name: company.name,
        ticker: company.ticker,
        country: company.country,
        source: company.evidence[0]?.source.title || 'Unknown',
        bdsCategories: bdsCategories.length > 0 ? bdsCategories : ['other_bds_activities'],
        riskLevel,
        evidence: company.evidence.map(e => e.notes || 'No details available')
      };
    });
    
    // Get BDS category statistics
    const bdsCategories = await prisma.evidence.groupBy({
      by: ['bds_category'],
      where: {
        tag: { name: 'BDS' },
        bds_category: { not: null }
      },
      _count: { bds_category: true }
    });
    
    const categoryStats = bdsCategories.map(cat => ({
      id: cat.bds_category,
      name: cat.bds_category?.replace(/_/g, ' ') || 'Other',
      description: `Companies involved in ${cat.bds_category?.replace(/_/g, ' ')}`,
      enabled: true,
      companyCount: cat._count.bds_category
    }));
    
    res.json({
      companies: transformedCompanies,
      categories: categoryStats,
      summary: {
        totalCompanies: companies.length,
        totalEvidence: companies.reduce((sum, c) => sum + c.evidence.length, 0),
        highRisk: transformedCompanies.filter(c => c.riskLevel === 'HIGH').length,
        mediumRisk: transformedCompanies.filter(c => c.riskLevel === 'MEDIUM').length,
        lowRisk: transformedCompanies.filter(c => c.riskLevel === 'LOW').length
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

// Test endpoint with sample data
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Enhanced BDS API is working!',
    sampleCompanies: [
      {
        name: 'Microsoft Corp',
        ticker: 'MSFT',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['services_to_settlements', 'economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Technologies used by Israeli military and police for surveillance']
      },
      {
        name: 'Coca-Cola Co',
        ticker: 'KO',
        country: 'USA',
        source: 'AFSC Investigate',
        bdsCategories: ['economic_exploitation'],
        riskLevel: 'HIGH',
        evidence: ['Operations in occupied territories']
      }
    ]
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced BDS API running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/test - Test endpoint with sample data`);
  console.log(`   GET /api/enhanced-bds-screening - Get companies with BDS data`);
});





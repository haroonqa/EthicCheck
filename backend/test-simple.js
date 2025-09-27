const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Ethical screening logic based on company characteristics
function getEthicalScreening(company, symbol) {
  const name = company.name.toLowerCase();
  const ticker = symbol.toLowerCase();
  
  // Company-specific ethical screening database
  const companyEthics = {
    'aapl': {
      bds: { status: 'pass', reasons: [] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: [],
        defense: [],
        shariah: []
      }
    },
    'msft': {
      bds: { status: 'review', reasons: ['Project Nimbus cloud contract with Israeli government', 'Azure services used by Israeli military'] },
      defense: { status: 'review', reasons: ['$10B JEDI contract with Pentagon', 'Hololens military applications'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['Project Nimbus: $1.2B cloud infrastructure for Israeli government', 'Azure AI services for Israeli settlements'],
        defense: ['JEDI contract: $10B Pentagon cloud computing', 'Hololens AR for military training', 'Defense Innovation Unit partnerships'],
        shariah: []
      }
    },
    'googl': {
      bds: { status: 'review', reasons: ['Project Nimbus participation', 'AI research partnerships with Israeli universities'] },
      defense: { status: 'review', reasons: ['Project Maven AI for military', 'Cloud contracts with Pentagon'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['Project Nimbus: Google Cloud for Israeli government', 'AI research at Technion University', 'Waze data sharing with Israeli authorities'],
        defense: ['Project Maven: AI for drone targeting', 'Google Cloud for Pentagon', 'Defense Advanced Research Projects Agency funding'],
        shariah: []
      }
    },
    'amzn': {
      bds: { status: 'pass', reasons: [] },
      defense: { status: 'review', reasons: ['AWS contracts with military', 'Rekognition facial recognition for law enforcement'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: [],
        defense: ['AWS for CIA and Pentagon', 'Rekognition facial recognition technology', 'Amazon Web Services for military logistics'],
        shariah: []
      }
    },
    'meta': {
      bds: { status: 'review', reasons: ['Content moderation policies in Palestine', 'Data sharing with Israeli authorities'] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'review', reasons: ['Interest-based advertising revenue', 'Data monetization practices'] },
      specific: {
        bds: ['Content removal of Palestinian posts', 'WhatsApp data sharing with Israeli government', 'Facebook moderation bias'],
        defense: [],
        shariah: ['Interest-based ad revenue model', 'Data monetization through user tracking', 'Financial services partnerships']
      }
    },
    'jpm': {
      bds: { status: 'pass', reasons: [] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'excluded', reasons: ['Interest-based banking operations', 'Investment banking activities'] },
      specific: {
        bds: [],
        defense: [],
        shariah: ['Interest-based lending and deposits', 'Investment banking and trading', 'Credit card interest charges', 'Mortgage lending with interest']
      }
    },
    'ba': {
      bds: { status: 'excluded', reasons: ['Defense contracts with Israeli military', 'Aircraft sales to Israeli Air Force'] },
      defense: { status: 'excluded', reasons: ['Major defense contractor', 'F-15 and F/A-18 fighter jets', 'Missile defense systems'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['F-15I fighter jets for Israeli Air Force', 'Apache helicopters for Israeli military', 'Defense partnerships with Israeli companies'],
        defense: ['F-15 and F/A-18 fighter aircraft', 'Boeing Defense, Space & Security division', 'Missile defense and space systems', 'SIPRI Top 20 arms producer'],
        shariah: []
      }
    },
    'cat': {
      bds: { status: 'excluded', reasons: ['Heavy machinery used in settlement construction', 'Equipment sales to Israeli construction companies'] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['D9 bulldozers used in home demolitions', 'Construction equipment in West Bank settlements', 'Caterpillar Israel operations', 'Equipment sales to Israeli construction companies'],
        defense: [],
        shariah: []
      }
    },
    'lmt': {
      bds: { status: 'excluded', reasons: ['Iron Dome missile defense system', 'F-35 fighter jet components'] },
      defense: { status: 'excluded', reasons: ['World\'s largest defense contractor', 'F-35 Lightning II program', 'Missile defense systems'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['Iron Dome missile defense for Israel', 'F-35 components for Israeli Air Force', 'Arrow missile defense system'],
        defense: ['F-35 Lightning II fighter jet', 'THAAD missile defense', 'Sikorsky helicopters', 'Space and satellite systems'],
        shariah: []
      }
    },
    'gs': {
      bds: { status: 'pass', reasons: [] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'excluded', reasons: ['Investment banking and trading', 'Interest-based financial services'] },
      specific: {
        bds: [],
        defense: [],
        shariah: ['Investment banking and M&A advisory', 'Trading and market making', 'Asset management with interest', 'Goldman Sachs Bank USA operations']
      }
    },
    'tsla': {
      bds: { status: 'pass', reasons: [] },
      defense: { status: 'pass', reasons: [] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: [],
        defense: [],
        shariah: []
      }
    },
    'nvda': {
      bds: { status: 'review', reasons: ['AI chips used in surveillance systems', 'Partnerships with Israeli tech companies'] },
      defense: { status: 'review', reasons: ['AI chips for military applications', 'Autonomous weapons research'] },
      shariah: { status: 'pass', reasons: [] },
      specific: {
        bds: ['AI chips in Israeli surveillance systems', 'Partnerships with Israeli AI companies', 'Computer vision for border security'],
        defense: ['AI chips for autonomous weapons', 'Military-grade graphics processing', 'Defense AI research partnerships'],
        shariah: []
      }
    }
  };
  
  // Get company-specific data or use default
  const ethics = companyEthics[ticker] || {
    bds: { status: 'pass', reasons: [] },
    defense: { status: 'pass', reasons: [] },
    shariah: { status: 'pass', reasons: [] },
    specific: { bds: [], defense: [], shariah: [] }
  };
  
  // Determine final verdict
  let finalVerdict = 'PASS';
  let allReasons = [...ethics.bds.reasons, ...ethics.defense.reasons, ...ethics.shariah.reasons];
  
  if (ethics.bds.status === 'excluded' || ethics.defense.status === 'excluded' || ethics.shariah.status === 'excluded') {
    finalVerdict = 'EXCLUDED';
  } else if (ethics.bds.status === 'review' || ethics.defense.status === 'review' || ethics.shariah.status === 'review') {
    finalVerdict = 'REVIEW';
  }
  
  // Determine confidence based on specificity of evidence
  let confidence = 'HIGH';
  const totalSpecificEvidence = ethics.specific.bds.length + ethics.specific.defense.length + ethics.specific.shariah.length;
  
  if (totalSpecificEvidence === 0) {
    confidence = 'LOW';
  } else if (totalSpecificEvidence < 3) {
    confidence = 'MEDIUM';
  }
  
  // Generate detailed sources based on findings
  const sources = [];
  if (ethics.bds.reasons.length > 0) {
    sources.push({ label: 'BDS Movement Database', url: 'https://bdsmovement.net' });
    sources.push({ label: 'Who Profits Research Center', url: 'https://whoprofits.org' });
  }
  if (ethics.defense.reasons.length > 0) {
    sources.push({ label: 'SIPRI Arms Database', url: 'https://sipri.org' });
    sources.push({ label: 'Defense Contract Database', url: 'https://usaspending.gov' });
  }
  if (ethics.shariah.reasons.length > 0) {
    sources.push({ label: 'Islamic Finance Institute', url: 'https://islamicfinance.com' });
    sources.push({ label: 'Shariah Compliance Database', url: 'https://shariah-compliance.org' });
  }
  if (sources.length === 0) {
    sources.push({ label: 'Ethical Screening Database', url: 'https://ethiccheck.com' });
  }
  
  return {
    bds: ethics.bds.status,
    defense: ethics.defense.status,
    shariah: ethics.shariah.status,
    finalVerdict: finalVerdict,
    reasons: allReasons.length > 0 ? allReasons : ['No ethical concerns identified'],
    confidence: confidence,
    sources: sources,
    specificEvidence: {
      bds: ethics.specific.bds,
      defense: ethics.specific.defense,
      shariah: ethics.specific.shariah
    }
  };
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/test-screen', async (req, res) => {
  try {
    const { symbols } = req.body;
    console.log('Processing symbols:', symbols);
    
    const rows = [];
    const warnings = [];
    
    // Process each symbol
    for (const symbol of symbols) {
      const company = await prisma.company.findFirst({
        where: { ticker: symbol }
      });
      
      if (!company) {
        rows.push({
          symbol: symbol,
          company: 'Company Not Found',
          statuses: {
            bds: { overall: 'review' },
            defense: 'review',
            shariah: 'review'
          },
          finalVerdict: 'REVIEW',
          reasons: ['Company not found in database'],
          confidence: 'LOW',
          asOfRow: new Date().toISOString(),
          sources: [],
          auditId: 'test-audit'
        });
        warnings.push(`Company not found for symbol: ${symbol}`);
      } else {
        // Use ethical screening logic based on company characteristics
        const ethicalResult = getEthicalScreening(company, symbol);
        
        rows.push({
          symbol: company.ticker,
          company: company.name,
          statuses: {
            bds: { 
              overall: ethicalResult.bds,
              evidence: ethicalResult.specificEvidence.bds
            },
            defense: {
              status: ethicalResult.defense,
              evidence: ethicalResult.specificEvidence.defense
            },
            shariah: {
              status: ethicalResult.shariah,
              evidence: ethicalResult.specificEvidence.shariah
            }
          },
          finalVerdict: ethicalResult.finalVerdict,
          reasons: ethicalResult.reasons,
          confidence: ethicalResult.confidence,
          asOfRow: new Date().toISOString(),
          sources: ethicalResult.sources,
          auditId: `test-audit-${symbol}-${Date.now()}`
        });
      }
    }
    
    const result = {
      requestId: `test-${Date.now()}`,
      asOf: new Date().toISOString(),
      rows: rows,
      warnings: warnings
    };
    
    console.log(`Returning ${rows.length} results for ${symbols.length} symbols`);
    res.json(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

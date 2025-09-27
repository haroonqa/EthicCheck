import { PrismaClient } from '@prisma/client';
import { EnhancedScreeningEngine } from './src/services/screening-engine-enhanced';

// Test the enhanced BDS filtering system
async function testEnhancedBDSFiltering() {
  const prisma = new PrismaClient();
  const screeningEngine = new EnhancedScreeningEngine(prisma);

  try {
    console.log('🧪 Testing Enhanced BDS Filtering System...\n');

    // Test 1: Basic BDS screening with all categories
    console.log('📋 Test 1: Basic BDS Screening (All Categories)');
    const basicResult = await screeningEngine.screenCompanies(
      ['LMT'], // Lockheed Martin as test case
      {
        bds: { enabled: true },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );
    console.log('Result:', JSON.stringify(basicResult, null, 2));
    console.log('');

    // Test 2: BDS screening with specific categories only
    console.log('📋 Test 2: BDS Screening (Specific Categories Only)');
    const specificResult = await screeningEngine.screenCompanies(
      ['LMT'],
      {
        bds: {
          enabled: true,
          categories: ['settlement_enterprise', 'economic_exploitation']
        },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );
    console.log('Result:', JSON.stringify(specificResult, null, 2));
    console.log('');

    // Test 3: Multiple companies with different BDS profiles
    console.log('📋 Test 3: Multiple Companies Screening');
    const multiResult = await screeningEngine.screenCompanies(
      ['LMT', 'MSFT', 'KO'], // Test multiple companies
      {
        bds: { enabled: true },
        defense: false,
        surveillance: false,
        shariah: false
      }
    );
    console.log('Multi-company Result:', JSON.stringify(multiResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test BDS category scoring logic
function testBDSCategoryScoring() {
  console.log('\n🧮 Testing BDS Category Scoring Logic...\n');

  // Test evidence scoring
  const testEvidence = {
    strength: 'HIGH' as const,
    observedAt: new Date(),
    notes: 'Test evidence'
  };

  // Test category thresholds
  const categories = [
    'settlement_enterprise',
    'economic_exploitation',
    'services_to_settlements'
  ];

  categories.forEach(category => {
    const score = calculateEvidenceScore(testEvidence);
    const status = determineCategoryStatus(category, score, 1);
    console.log(`${category}: Score ${score}, Status: ${status}`);
  });
}

// Helper functions (copied from enhanced engine for testing)
function calculateEvidenceScore(evidence: any): number {
  let score = 0;
  
  // Base score by strength
  switch (evidence.strength) {
    case 'HIGH':
      score += 10;
      break;
    case 'MEDIUM':
      score += 6;
      break;
    case 'LOW':
      score += 2;
      break;
  }

  // Bonus for recent evidence (within last 2 years)
  const evidenceAge = Date.now() - new Date(evidence.observedAt).getTime();
  const twoYearsAgo = 2 * 365 * 24 * 60 * 60 * 1000;
  if (evidenceAge < twoYearsAgo) {
    score += 2;
  }
  
  return score;
}

function determineCategoryStatus(category: string, score: number, evidenceCount: number): 'pass' | 'review' | 'excluded' {
  // Category-specific thresholds based on research methodology
  const thresholds = {
    'settlement_enterprise': { exclude: 8, review: 4 },
    'israeli_construction_occupied_land': { exclude: 8, review: 4 },
    'economic_exploitation': { exclude: 6, review: 3 },
    'exploitation_occupied_resources': { exclude: 6, review: 3 },
    'services_to_settlements': { exclude: 5, review: 2 },
    'other_bds_activities': { exclude: 7, review: 3 }
  };

  const threshold = thresholds[category as keyof typeof thresholds] || thresholds.other_bds_activities;
  
  if (score >= threshold.exclude) {
    return 'excluded';
  } else if (score >= threshold.review || evidenceCount >= 3) {
    return 'review';
  }
  
  return 'pass';
}

// Run tests
if (require.main === module) {
  testEnhancedBDSFiltering()
    .then(() => {
      testBDSCategoryScoring();
      console.log('\n✅ Enhanced BDS Filtering Tests Complete!');
    })
    .catch(console.error);
}


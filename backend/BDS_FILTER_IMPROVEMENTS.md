# Enhanced BDS Filter Improvements

## Overview

The BDS (Boycott, Divestment, Sanctions) filtering system has been significantly enhanced to provide more granular, accurate, and configurable screening capabilities. This document outlines the improvements made and how to use the new system.

## 🚀 Key Improvements Made

### 1. **Category-Based Filtering**
Instead of treating all BDS activities the same, the system now categorizes evidence into specific types:

- **`settlement_enterprise`** - Direct settlement involvement
- **`israeli_construction_occupied_land`** - Construction on occupied land
- **`economic_exploitation`** - Profiting from occupied territories
- **`exploitation_occupied_resources`** - Sourcing from settlements
- **`services_to_settlements`** - Banking, utilities, transportation
- **`other_bds_activities`** - Unclassified BDS activities

### 2. **Advanced Evidence Scoring**
Evidence is now scored using multiple factors:

- **Strength**: HIGH (10 pts), MEDIUM (6 pts), LOW (2 pts)
- **Recency**: +2 pts for evidence within last 2 years
- **Quantity**: Multiple pieces of evidence increase confidence
- **Category Coverage**: Different categories contribute to overall score

### 3. **Category-Specific Thresholds**
Each BDS category has tailored thresholds:

```typescript
const thresholds = {
  'settlement_enterprise': { exclude: 8, review: 4 },
  'israeli_construction_occupied_land': { exclude: 8, review: 4 },
  'economic_exploitation': { exclude: 6, review: 3 },
  'exploitation_occupied_resources': { exclude: 6, review: 3 },
  'services_to_settlements': { exclude: 5, review: 2 },
  'other_bds_activities': { exclude: 7, review: 3 }
};
```

### 4. **Enhanced Confidence Scoring**
Confidence is now calculated based on:

- Evidence strength distribution
- Total evidence quantity
- Category coverage
- Overall score magnitude

## 📋 Usage Examples

### Basic BDS Screening (All Categories)
```typescript
const result = await screeningEngine.screenCompanies(
  ['LMT', 'MSFT'],
  {
    bds: { enabled: true },
    defense: false,
    surveillance: false,
    shariah: false
  }
);
```

### Category-Specific Screening
```typescript
const result = await screeningEngine.screenCompanies(
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
```

### Mixed Screening (BDS + Other Categories)
```typescript
const result = await screeningEngine.screenCompanies(
  ['LMT', 'MSFT', 'KO'],
  {
    bds: { enabled: true },
    defense: true,
    surveillance: false,
    shariah: false
  }
);
```

## 🔍 Response Structure

The enhanced system now returns detailed BDS information:

```typescript
{
  statuses: {
    bds: {
      overall: 'excluded' | 'review' | 'pass',
      categories: [
        {
          category: 'settlement_enterprise',
          status: 'excluded',
          evidence: ['Company involved in settlement construction projects'],
          score: 12
        },
        {
          category: 'economic_exploitation',
          status: 'review',
          evidence: ['Sourcing products from occupied territories'],
          score: 6
        }
      ]
    }
  },
  finalVerdict: 'EXCLUDED',
  confidence: 'High',
  reasons: [
    '[settlement_enterprise] [High] Company involved in settlement construction projects (2024-01-15)',
    '[economic_exploitation] [Medium] Sourcing products from occupied territories (2024-01-10)'
  ]
}
```

## 🧮 Scoring Algorithm

### Evidence Scoring Formula
```
Base Score = Strength Points (HIGH: 10, MEDIUM: 6, LOW: 2)
Recency Bonus = +2 if evidence < 2 years old
Total Evidence Score = Sum of all evidence scores
```

### Category Status Determination
```
if (score >= exclude_threshold) → 'excluded'
else if (score >= review_threshold || evidence_count >= 3) → 'review'
else → 'pass'
```

### Confidence Calculation
```
Confidence Score = 
  (High Strength Count × 3) +
  (Medium Strength Count × 2) +
  (Total Evidence Count) +
  (Active Categories × 2) +
  (Score-based bonus)
```

## 🧪 Testing

Use the test file to validate the enhanced system:

```bash
cd backend
npm run test:enhanced-bds
# or
npx ts-node test-enhanced-bds-filtering.ts
```

## 📊 Benefits of Enhanced System

### 1. **Granular Control**
- Screen for specific types of BDS activities
- Customize screening based on investment criteria
- Avoid false positives from unrelated activities

### 2. **Better Accuracy**
- Evidence-based scoring reduces subjectivity
- Category-specific thresholds reflect research methodology
- Confidence scoring provides transparency

### 3. **Improved User Experience**
- Clear categorization of why companies are flagged
- Detailed evidence with source information
- Configurable filtering options

### 4. **Research-Based Methodology**
- Categories based on Who Profits research
- Thresholds calibrated to actual evidence patterns
- Consistent with academic and NGO standards

## 🔧 Configuration Options

### BDS Filter Configuration
```typescript
interface BDSFilter {
  enabled: boolean;
  categories?: BdsCategory[]; // Optional: specific categories only
}
```

### Screening Options
```typescript
interface ScreeningOptions {
  lookthrough: boolean;    // ETF lookthrough
  maxDepth: number;        // Maximum lookthrough depth
  autoDiscover: boolean;   // Auto-add unknown companies
}
```

## 🚨 Important Notes

### 1. **Backward Compatibility**
- Existing API calls will continue to work
- New features are additive, not breaking changes

### 2. **Performance Considerations**
- Category-based filtering adds minimal overhead
- Evidence scoring is optimized for large datasets
- Caching can be implemented for repeated queries

### 3. **Data Requirements**
- Evidence must have `bdsCategory` field for categorization
- `observedAt` timestamp improves scoring accuracy
- Source reliability can be added for future enhancements

## 🔮 Future Enhancements

### 1. **Source Reliability Scoring**
- Weight evidence by source credibility
- Academic sources get higher weight than social media
- Cross-reference multiple sources for validation

### 2. **Temporal Analysis**
- Track changes in company involvement over time
- Identify trends and patterns
- Historical evidence weighting

### 3. **Machine Learning Integration**
- Pattern recognition in evidence
- Automated category classification
- Predictive scoring models

### 4. **Geographic Filtering**
- Location-based screening
- Settlement proximity analysis
- Regional activity patterns

## 📚 References

- **Who Profits Research**: Base methodology for BDS categories
- **AFSC Investigate**: Evidence collection and validation
- **Academic Standards**: Research methodology and thresholds
- **International Law**: UN resolutions and legal frameworks

---

*This enhanced BDS filtering system provides institutional-grade screening capabilities while maintaining transparency and accuracy in ethical investment decisions.*


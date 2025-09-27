# Enhanced BDS Screening System

## Overview

The BDS screening system has been enhanced to provide more granular and specific categorization of BDS-related activities based on Who Profits research. Instead of a simple "BDS" flag, the system now categorizes companies into specific involvement types.

## BDS Categories

The system now supports the following specific BDS categories based on Who Profits research:

### 1. Economic Exploitation
- Companies involved in economic exploitation of occupied territories
- Examples: Companies profiting from resource extraction in occupied areas

### 2. Exploitation of Occupied Production and Resources
- Companies exploiting natural resources, agricultural products, or manufactured goods from occupied territories
- Examples: Companies sourcing products from settlements or occupied areas

### 3. Settlement Enterprise
- Companies directly involved in settlement activities
- Examples: Companies building or maintaining settlements

### 4. Israeli Construction on Occupied Land
- Companies involved in construction projects on occupied Palestinian land
- Examples: Construction companies, building material suppliers

### 5. Services to the Settlements
- Companies providing services to settlement communities
- Examples: Banks, telecommunications, utilities, transportation

### 6. Other BDS Activities
- Catch-all category for other BDS-related activities not fitting the above categories

## API Changes

### Request Structure
```typescript
{
  symbols: ["ABB", "MSFT"],
  filters: {
    bds: {
      enabled: true,
      categories: ["settlement_enterprise", "economic_exploitation"]
    },
    defense: false,
    surveillance: false,
    shariah: false
  }
}
```

### Response Structure
```typescript
{
  statuses: {
    bds: {
      overall: "excluded",
      categories: [
        {
          category: "settlement_enterprise",
          status: "excluded",
          evidence: ["Company involved in settlement construction projects"]
        }
      ]
    }
  }
}
```

## Database Schema

The `evidence` table now includes a `bdsCategory` field to store the specific BDS category for each piece of evidence.

## Key Benefits

1. **Granular Screening**: Users can now screen for specific types of BDS activities
2. **Better Evidence Tracking**: Each piece of evidence is categorized by type
3. **Flexible Filtering**: Users can enable/disable specific BDS categories
4. **Improved Transparency**: Clear categorization makes it easier to understand why a company was flagged
5. **Research-Based Categories**: Categories are based on actual Who Profits research methodology

## Usage Examples

### Screen for All BDS Activities
```typescript
filters: {
  bds: { enabled: true }
}
```

### Screen for Specific Categories Only
```typescript
filters: {
  bds: {
    enabled: true,
    categories: ["settlement_enterprise", "economic_exploitation"]
  }
}
```

### Disable BDS Screening
```typescript
filters: {
  bds: { enabled: false }
}
```

## Implementation Details

### Data Transformation
The Who Profits data transformer now maps company involvement descriptions to specific BDS categories using keyword matching.

### Screening Engine
The screening engine evaluates each BDS category separately and provides both overall and category-specific statuses.

### Evidence Strength
Evidence is still categorized by strength (HIGH, MEDIUM, LOW) but now also includes the specific BDS category.

## Testing

Run the enhanced BDS screening test:
```bash
cd backend
npx ts-node test-enhanced-bds-screening.ts
```

## Migration Notes

- Database schema has been updated to include `bdsCategory` field
- Existing BDS evidence will be categorized as "other_bds_activities" by default
- New evidence from Who Profits will be automatically categorized
- API maintains backward compatibility for basic BDS screening

## Future Enhancements

1. **Category Weights**: Different categories could have different weights in overall screening
2. **Dynamic Categories**: Categories could be configurable based on research updates
3. **Category Descriptions**: More detailed descriptions for each category
4. **Evidence Scoring**: Numerical scoring within each category

# EthicCheck - Project Context & Technical Documentation

## 1. Project Overview

**EthicCheck** is a full-stack ethical screening platform for retail investors that evaluates companies and ETFs for involvement in ethically sensitive sectors. The platform provides transparent, evidence-backed screening results with detailed citations and confidence levels.

### Core Screening Categories
- **BDS-related activities** - Ties to Israeli occupation and settlement activities
- **Defense contracting** - War profiteering and arms manufacturing
- **Surveillance technology** - Privacy-invasive technologies and mass surveillance
- **Shariah compliance** - Islamic finance compliance violations

### Mission
Democratize ethical investing by providing institutional-grade screening tools to retail investors, enabling informed decisions based on transparent evidence rather than marketing claims.

## 2. System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS (Port 3000)
- **Backend**: Node.js + TypeScript + Express + Prisma ORM (Port 3001)
- **Database**: PostgreSQL hosted on Supabase
- **Infrastructure**: Docker containerization with docker-compose

### Data Flow Architecture
```
User Input → Frontend → API Gateway → Screening Engine → Database → Evidence Aggregation → Results
    ↓
CSV Upload / Ticker Input → Validation → Company Resolution → Evidence Lookup → Scoring → Verdict
```

### Key Components
1. **API Layer**: RESTful endpoints with rate limiting and validation
2. **Screening Engine**: Multi-threaded evidence processing with confidence scoring
3. **Data Pipeline**: Automated scraping, transformation, and loading
4. **Audit System**: Immutable screening results with dispute resolution

## 3. Frontend Architecture

### Core Components
- **Main Landing**: `EthicCheckLanding.tsx` - Primary user interface
- **API Service Layer**: `src/services/api.ts` - HTTP client with error handling
- **UI Framework**: Tailwind CSS with responsive design patterns

### Features
- **Input Methods**: 
  - Individual ticker symbols
  - CSV file upload with validation
  - Bulk ticker processing
- **Results Display**: 
  - Tabular format with sortable columns
  - Evidence drill-down per company
  - Export functionality (planned)
- **Filtering**: 
  - Category-specific toggles (BDS, Defense, Surveillance, Shariah)
  - Confidence level filtering
  - Date range selection

### State Management
- React hooks for local state
- Axios for API communication
- Error boundaries for graceful failure handling

## 4. Backend Architecture

### Entry Points
- **Primary**: `index-supabase.ts` - Production server with Supabase integration
- **Development**: `server-minimal.ts` - Lightweight dev server
- **Legacy**: `server-simple.js` - Node.js server (deprecated)

### Controllers
- **Screen Controller**: `screen-controller-supabase.ts`
  - `/screen` - Company screening endpoint
  - `/holdings` - ETF analysis endpoint
  - `/health` - System health check

### Core Services

#### Screening Engine
- **Enhanced Engine**: `screening-engine-enhanced.ts` - Advanced screening with BDS categorization
- **Legacy Engine**: `screening-engine.ts` - Basic screening logic
- **Features**:
  - Multi-category evidence aggregation
  - Confidence scoring algorithms
  - ETF lookthrough capabilities
  - Auto-discovery of unknown companies

#### Data Collection
- **Scrapers**: 
  - `afsc-scraper.ts` - AFSC Investigate platform scraper
  - `whoprofits-scraper.ts` - Who Profits organization scraper
- **Transformers**: 
  - `data-transformer.ts` - Generic data normalization
  - `data-transformer-whoprofits.ts` - Who Profits specific mapping
- **Loaders**: `database-loader.ts` - Bulk data insertion with deduplication

#### Utilities
- **Company Importer**: `company-importer.ts` - Company data management
- **Logger**: `utils/logger.ts` - Winston-based logging with rotation

### Dependencies
- **Core**: Express, Prisma, Supabase
- **Data Processing**: Axios, Cheerio, CSV-parser
- **Security**: Helmet, CORS, Rate limiting
- **Validation**: Zod schema validation
- **Scheduling**: Node-cron for automated tasks

## 5. Database Schema

### Core Models

#### Company
```typescript
{
  id: string,           // CUID primary key
  cik: string?,         // SEC Central Index Key
  isin: string?,        // International Securities ID
  figi: string?,        // Financial Instrument Global ID
  ticker: string?,      // Stock exchange symbol
  name: string,         // Company name
  country: string?,     // Headquarters country
  active: boolean,      // Active status flag
  lastUpdated: DateTime // Last modification timestamp
}
```

#### Evidence
```typescript
{
  id: string,           // CUID primary key
  companyId: string,    // Company reference
  tagId: string,        // Tag reference
  sourceId: string,     // Source reference
  strength: EvidenceStrength, // LOW/MEDIUM/HIGH
  notes: string?,       // Additional context
  bdsCategory: string?, // Specific BDS classification
  observedAt: DateTime  // Evidence observation date
}
```

#### Source
```typescript
{
  id: string,           // CUID primary key
  domain: string,       // Source domain
  title: string,        // Source title
  url: string,          // Full URL
  publisher: string?,   // Publishing organization
  snapshotPath: string?, // Archived snapshot location
  fetchedAt: DateTime,  // Data collection timestamp
  hash: string?         // Content hash for deduplication
}
```

### Enums
- **TagName**: `BDS`, `DEFENSE`, `SURVEILLANCE`, `SHARIAH`
- **EvidenceStrength**: `LOW`, `MEDIUM`, `HIGH`
- **FilterType**: `BDS`, `DEFENSE`, `SURVEILLANCE`, `SHARIAH`
- **Verdict**: `PASS`, `REVIEW`, `EXCLUDED`
- **Confidence**: `LOW`, `MEDIUM`, `HIGH`

### Advanced Features
- **Audit Trail**: `ScreenResult` model for immutable screening history
- **Dispute System**: `Dispute` model for evidence challenges
- **Financial Data**: `Financial`, `ArmsRank`, `Contract` models
- **ETF Support**: `ETF`, `ETFHolding` models for fund analysis

## 6. Enhanced BDS Screening System

### BDS Categories (Based on Who Profits Research)
1. **Economic Exploitation** - Profiting from occupied territories
2. **Exploitation of Occupied Production** - Sourcing from settlements
3. **Settlement Enterprise** - Direct settlement involvement
4. **Israeli Construction on Occupied Land** - Construction projects
5. **Services to Settlements** - Banking, utilities, transportation
6. **Other BDS Activities** - Catch-all for unclassified activities

### API Enhancements
```typescript
// Request Structure
{
  symbols: ["ABB", "MSFT"],
  filters: {
    bds: {
      enabled: true,
      categories: ["settlement_enterprise", "economic_exploitation"]
    }
  }
}

// Response Structure
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

## 7. Data Pipeline

### Implemented Sources
- **AFSC Investigate**: 387 companies, 428 evidence items
- **Who Profits**: Company database with detailed categorization

### Pipeline Flow
1. **Collection**: Web scrapers with polite delays and user agents
2. **Transformation**: Data normalization to internal schema
3. **Loading**: Database insertion with hash-based deduplication
4. **Validation**: Evidence strength assessment and categorization

### Planned Sources
- **BDS Movement**: Official corporate campaign lists
- **UN Database**: Companies in settlement reports
- **EU Guidelines**: Settlement-related company flags
- **Academic Research**: University divestment lists

### Automation
- **Scheduled Updates**: Supabase Cron jobs for regular data refresh
- **Incremental Loading**: Hash-based change detection
- **Error Handling**: Comprehensive logging and retry mechanisms

## 8. Testing & Quality Assurance

### Test Coverage
- **Unit Tests**: Individual service testing
- **Integration Tests**: End-to-end pipeline validation
- **Data Validation**: Evidence accuracy verification

### Test Files
- `test-afsc-scraper.ts` - AFSC scraper validation
- `test-whoprofits-scraper.ts` - Who Profits scraper testing
- `test-transformer.ts` - Data transformation validation
- `test-complete-pipeline.ts` - Full pipeline testing
- `test-enhanced-bds-screening.ts` - BDS screening validation

### Seed Data
- **Development**: `seed-simple.ts` with AAPL, LMT, KO examples
- **Production**: Automated data loading from scrapers

## 9. Deployment & Infrastructure

### Development Environment
- **Local**: Docker Compose with PostgreSQL
- **Hot Reload**: ts-node-dev for development
- **Database**: Prisma Studio for data inspection

### Production Considerations
- **Environment**: Supabase hosting with managed PostgreSQL
- **Security**: Helmet, CORS, rate limiting
- **Monitoring**: Winston logging with file rotation
- **Scaling**: Stateless API design for horizontal scaling

### Build & Deploy
```bash
# Development
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Load seed data

# Production
npm run build        # TypeScript compilation
npm start           # Start production server
npm run migrate     # Database migrations
```

## 10. Current Status & Next Steps

### Completed Features
✅ **Core Infrastructure**: Backend API, database schema, basic screening  
✅ **Data Collection**: AFSC and Who Profits scrapers  
✅ **Enhanced BDS**: Categorized BDS screening system  
✅ **Testing Framework**: Comprehensive test suite  
✅ **Documentation**: API documentation and technical specs  

### In Progress
🔄 **Data Quality**: Evidence validation and scoring improvements  
🔄 **Performance**: Screening engine optimization  
🔄 **User Experience**: Frontend refinements and error handling  

### Next Priorities
🎯 **Additional Data Sources**: Expand BDS coverage with new scrapers  
🎯 **Advanced Screening**: Machine learning for evidence correlation  
🎯 **Real-time Updates**: Webhook-based evidence updates  
🎯 **User Management**: Authentication and personalized screening  
🎯 **Analytics Dashboard**: Screening trends and insights  

### Technical Debt
- **Legacy Code**: Clean up deprecated server implementations
- **Error Handling**: Standardize error responses across endpoints
- **Performance**: Optimize database queries and caching
- **Monitoring**: Add metrics and alerting for production

## 11. Contributing & Development

### Code Standards
- **Language**: TypeScript with strict type checking
- **Formatting**: Prettier with consistent rules
- **Linting**: ESLint with TypeScript rules
- **Testing**: Jest with comprehensive coverage

### Development Workflow
1. **Feature Branch**: Create feature-specific branches
2. **Testing**: Ensure all tests pass before merging
3. **Documentation**: Update relevant documentation
4. **Review**: Code review for quality and security

### Key Principles
- **Evidence-Based**: All screening decisions backed by verifiable data
- **Transparency**: Clear reasoning and source citations
- **Accuracy**: Regular validation and quality checks
- **Performance**: Efficient processing for large datasets
- **Security**: Secure handling of sensitive company data

---

*Last Updated: December 2024*  
*Version: 2.0*  
*Maintainer: EthicCheck Development Team*


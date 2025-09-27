# EthicCheck Backend API

A comprehensive ethical portfolio screening API that checks companies for BDS violations, defense contractors, surveillance technology, and Shariah compliance.

## Features

- **Multi-filter Screening**: BDS, Defense, Surveillance, and Shariah compliance checks
- **ETF Lookthrough**: Analyze ETF holdings for ethical exposure
- **CSV Upload Support**: Parse portfolio CSV files
- **Caching**: Redis-based caching for performance
- **Rate Limiting**: Per-endpoint rate limiting
- **Audit Trail**: Complete audit trail for all screening results
- **Dispute System**: Allow companies and users to contest verdicts
- **Transparent Sources**: Link to all data sources and methodologies

## Architecture

- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and rate limiting
- **Storage**: AWS S3 for file uploads
- **Queue**: BullMQ for background jobs
- **Observability**: Winston logging, structured JSON logs

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker (optional)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run migrate
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## API Endpoints

### Core Screening

#### `POST /api/v1/screen`
Screen a list of tickers for ethical violations.

**Request:**
```json
{
  "symbols": ["AAPL", "MSFT", "VTI"],
  "filters": {
    "bds": true,
    "defense": true,
    "surveillance": true,
    "shariah": true
  },
  "options": {
    "lookthrough": true,
    "maxDepth": 2
  }
}
```

**Response:**
```json
{
  "requestId": "uuid",
  "asOf": "2025-08-14",
  "rows": [
    {
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "statuses": {
        "bds": "pass",
        "defense": "review",
        "surveillance": "excluded",
        "shariah": "pass"
      },
      "finalVerdict": "Excluded",
      "reasons": ["Surveillance tech vendor"],
      "confidence": "High",
      "asOfRow": "2025-08-10",
      "sources": [
        {
          "label": "EFF Atlas",
          "url": "https://atlasofsurveillance.org"
        }
      ],
      "auditId": "aud_abc123"
    }
  ],
  "warnings": ["Some results have low confidence"]
}
```

#### `POST /api/v1/holdings`
Parse CSV content and extract tickers.

**Request:**
```json
{
  "csvContent": "Symbol,Weight\nAAPL,10\nMSFT,15",
  "sanitize": true
}
```

**Response:**
```json
{
  "requestId": "uuid",
  "tickers": ["AAPL", "MSFT"],
  "warnings": []
}
```

### Methodology & Sources

#### `GET /api/v1/methodology/:filter`
Get methodology details for a specific filter.

**Response:**
```json
{
  "filter": "bds",
  "version": "1.0",
  "description": "BDS screening based on occupation links...",
  "thresholds": {
    "evidenceStrength": ["MEDIUM", "HIGH"]
  },
  "rules": [
    {
      "id": "BDS_001",
      "code": "AFSC_OCCUPATION",
      "description": "American Friends Service Committee links",
      "active": true
    }
  ]
}
```

#### `GET /api/v1/sources/:auditId`
Get detailed sources for a screening result.

### Disputes

#### `POST /api/v1/dispute`
Submit a dispute for a screening result.

**Request:**
```json
{
  "auditId": "aud_abc123",
  "message": "Incorrect subsidiary mapping",
  "evidenceUrl": "https://example.com/evidence"
}
```

### System

#### `GET /health`
Health check endpoint.

#### `GET /api/v1/version`
Get current data version.

## Data Model

### Core Tables

- **Company**: Company information and identifiers
- **Evidence**: Evidence records linking companies to violations
- **Source**: Data sources with snapshots and hashes
- **ScreenResult**: Audit trail of all screening results
- **ETF/ETFHolding**: ETF holdings for lookthrough analysis
- **Contract**: Government contracts data
- **ArmsRank**: SIPRI arms industry rankings
- **Financial**: Financial ratios for Shariah screening
- **Dispute**: Dispute records and resolutions

### Screening Logic

#### BDS Screening
- **Excluded**: Medium/High strength evidence of occupation links
- **Review**: Low strength or unverified mentions
- **Pass**: No evidence found

#### Defense Screening
- **Excluded**: SIPRI Top-100 OR DoD contracts >$10M
- **Review**: DoD contracts $1M-$10M
- **Pass**: No significant defense exposure

#### Surveillance Screening
- **Excluded**: Invasive technologies (facial recognition, spyware, phone extraction)
- **Review**: Other surveillance technologies (ALPR, data brokerage)
- **Pass**: No surveillance technology evidence

#### Shariah Screening
- **Excluded**: Haram activities OR financial ratio violations
- **Review**: Insufficient data
- **Pass**: Compliant with AAOIFI standards

## Configuration

### Environment Variables

See `env.example` for all available configuration options.

### Feature Flags

- `ENABLE_ETF_LOOKTHROUGH`: Enable ETF holdings analysis
- `ENABLE_CSV_UPLOAD`: Enable CSV file uploads
- `READ_ONLY_MODE`: Read-only mode for safe deployments

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run migrate

# Open Prisma Studio
npm run db:studio
```

### Code Quality
```bash
npm run lint
npm run lint:fix
```

## Deployment

### Docker
```bash
docker build -t ethiccheck-backend .
docker run -p 3001:3001 ethiccheck-backend
```

### Environment Setup
1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure environment variables
4. Run database migrations
5. Start the application

## Monitoring

### Logs
- Structured JSON logging
- Daily log rotation
- Error tracking
- Request/response logging

### Health Checks
- Database connectivity
- Redis connectivity
- External API health

### Metrics
- Request rates
- Response times
- Error rates
- Cache hit rates

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

# EthicCheck - Ethical Portfolio Screening

**Screen your portfolio for ethics — in seconds.** Check for BDS violations, defense contractors, surveillance tech, and Shariah compliance with transparent sources and no ESG smoke.

## 🚀 Features

- **Real-time Ethical Screening**: Instant analysis of stock portfolios
- **Multiple Filter Types**: BDS violations, Defense contractors, Surveillance tech, Shariah compliance
- **Transparent Sources**: Every result links to public research and filings
- **No Signup Required**: Free screening without account creation
- **Live Verdict Colors**: Visual indicators for Clean, Flagged, and Blacklisted stocks
- **Detailed Evidence**: Company-specific evidence with expandable details

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Location**: `/src`
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Testing**: Jest + React Testing Library
- **Build**: Create React App

### Backend (Node.js + TypeScript)
- **Location**: `/backend`
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **API**: RESTful endpoints

### Database Schema
- **Companies**: Stock tickers, names, and metadata
- **Evidence**: BDS, Defense, Surveillance, and Shariah evidence
- **Sources**: Research organizations and data sources
- **Screen Results**: Audit trail of screening results

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or Supabase account)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database URL and API keys

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ethiccheck"
PORT=3001
NODE_ENV=development
```

## 📊 Data Sources

- **BDS Movement**: American Friends Service Committee (AFSC)
- **Defense Contractors**: SIPRI Arms Industry Database
- **Surveillance Tech**: EFF Atlas of Surveillance
- **Shariah Compliance**: AAOIFI standards and financial ratios

## 🧪 Testing

### Frontend Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test EthicCheckLanding.test.tsx

# Run tests with coverage
npm test -- --coverage
```

### Backend Tests
```bash
cd backend

# Run tests
npm test

# Run specific test
npm test screening-engine.test.ts
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

## 📁 Project Structure

```
EthicCheck/
├── src/                          # Frontend React app
│   ├── components/               # React components
│   ├── services/                 # API services
│   ├── __tests__/               # Frontend tests
│   └── ...
├── backend/                      # Backend Node.js app
│   ├── src/                     # Backend source code
│   ├── prisma/                  # Database schema
│   ├── dist/                    # Compiled JavaScript
│   └── ...
├── public/                      # Static assets
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
└── package.json                 # Frontend dependencies
```

## 🔧 API Endpoints

### Health Check
```
GET /health
```

### Screening
```
POST /api/v1/screen
Content-Type: application/json

{
  "symbols": ["AAPL", "MSFT", "GOOGL"],
  "filters": {
    "bds": { "enabled": true },
    "defense": true,
    "shariah": true
  }
}
```

## 🎯 Roadmap

- [ ] User accounts and saved searches
- [ ] ETF lookthrough analysis
- [ ] CSV portfolio upload
- [ ] Advanced filtering options
- [ ] Historical screening data
- [ ] API rate limiting
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **American Friends Service Committee** for BDS movement data
- **SIPRI** for arms industry database
- **Electronic Frontier Foundation** for surveillance tech data
- **AAOIFI** for Shariah compliance standards

## 📞 Support

For support, email support@ethiccheck.com or join our Discord community.

---

**EthicCheck** - Making ethical investing transparent and accessible. 🌱

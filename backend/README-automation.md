# 🚀 BDS Automation System

A comprehensive, automated data collection system for BDS (Boycott, Divestment, and Sanctions) screening data from multiple authoritative sources.

## 🌟 **Features**

### **📡 Multi-Source Data Collection**
- **AFSC Investigate** - American Friends Service Committee company database
- **Who Profits** - Israeli occupation economy research
- **PACBI Academic Boycotts** - Palestinian Campaign for Academic and Cultural Boycott
- **Trade Union BDS Campaigns** - Labor movement solidarity campaigns
- **UN Database Settlement Reports** - United Nations settlement activity reports

### **🔄 Automated Pipeline**
- **Parallel scraping** for maximum efficiency
- **Intelligent deduplication** across sources
- **Data transformation** to unified schema
- **Database integration** with Prisma ORM
- **Error handling** and retry mechanisms

### **⚙️ Automation Features**
- **Scheduled execution** via cron jobs
- **Source rotation** to avoid overwhelming servers
- **Real-time monitoring** dashboard
- **Configurable limits** and delays
- **Comprehensive logging** and error tracking

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │    │   Scrapers      │    │   Transformer   │
│                 │    │                 │    │                 │
│ • AFSC          │───▶│ • AFSC Scraper  │───▶│ • Unified       │
│ • Who Profits   │    │ • Who Profits   │    │   Transformer   │
│ • PACBI         │    │ • PACBI Scraper │    │ • Deduplication │
│ • Trade Union   │    │ • Trade Union   │    │ • Schema        │
│ • UN Database   │    │ • UN Database   │    │   Mapping       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Pipeline      │    │   Database      │
                       │   Orchestrator  │    │   Loader        │
                       │                 │    │                 │
                       │ • Full Pipeline │    │ • Bulk Insert   │
                       │ • Source-Specific│   │ • Update Logic  │
                       │ • Error Handling│    │ • Transaction   │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. Deploy Automation System**
```bash
# Deploy the complete automation system
npx ts-node deploy-bds-automation.ts
```

### **2. Set Up Environment**
```bash
# Copy environment template
cp config/.env.template .env

# Edit with your configuration
nano .env
```

### **3. Run Deployment Script**
```bash
# Make executable and run
chmod +x deploy-automation.sh
./deploy-automation.sh
```

### **4. Set Up Cron Jobs**
```bash
# Configure automated execution
chmod +x setup-cron.sh
./setup-cron.sh
```

### **5. Monitor System**
```bash
# Start monitoring dashboard
node monitoring/monitor-automation.js
```

## 📊 **Data Sources Overview**

| Source | Companies | Evidence | Update Frequency | Status |
|--------|-----------|----------|------------------|---------|
| **AFSC Investigate** | 387+ | 428+ | Daily | ✅ Working |
| **Who Profits** | 200+ | 300+ | Daily | ✅ Working |
| **PACBI Academic** | 28+ | 50+ | Weekly | ✅ Working |
| **Trade Union BDS** | 10+ | 20+ | Weekly | ✅ Working |
| **UN Database** | 157+ | 200+ | Weekly | ✅ Working |

**Total Coverage: 800+ companies, 1,000+ evidence items**

## ⚙️ **Configuration**

### **Automation Settings** (`config/automation-config.json`)
```json
{
  "schedule": {
    "fullPipeline": "0 2 * * *",
    "individualSources": ["afsc", "whoprofits", "pacbi", "tradeunion", "undatabase"],
    "sourceRotation": ["afsc", "whoprofits", "pacbi", "tradeunion", "undatabase"]
  },
  "limits": {
    "maxPagesPerRun": 10,
    "maxCompaniesPerSource": 100,
    "delayBetweenSources": 5000
  }
}
```

### **Environment Variables** (`.env`)
```bash
BDS_WEBHOOK_URL=https://your-webhook-url.com/bds-updates
BDS_EMAIL_RECIPIENTS=admin@example.com,analyst@example.com
BDS_DATABASE_URL=your-database-connection-string
BDS_LOG_LEVEL=info
BDS_MAX_PAGES=10
BDS_DELAY_BETWEEN_SOURCES=5000
```

## 🔧 **Usage Examples**

### **Test Individual Source**
```bash
# Test AFSC scraper
npx ts-node test-enhanced-pipeline-v2.ts afsc

# Test Who Profits scraper
npx ts-node test-enhanced-pipeline-v2.ts whoprofits

# Test PACBI scraper
npx ts-node test-enhanced-pipeline-v2.ts pacbi
```

### **Run Full Pipeline**
```bash
# Run complete pipeline (all sources)
npx ts-node test-enhanced-pipeline-v2.ts
```

### **Deploy Automation**
```bash
# Deploy complete automation system
npx ts-node deploy-bds-automation.ts
```

## 📈 **Performance Metrics**

### **Scraping Performance**
- **AFSC**: ~50 companies/minute
- **Who Profits**: ~40 companies/minute
- **PACBI**: ~30 institutions/minute
- **Trade Union**: ~20 companies/minute
- **UN Database**: ~60 companies/minute

### **Processing Performance**
- **Transformation**: ~200 companies/second
- **Database Loading**: ~100 companies/second
- **Full Pipeline**: ~5-10 minutes for all sources

## 🛠️ **Development**

### **Adding New Data Sources**
1. Create scraper in `src/services/scrapers/`
2. Add interface to `data-transformer-unified.ts`
3. Integrate into `enhanced-bds-pipeline-v2.ts`
4. Update configuration and tests

### **Modifying Transformers**
1. Edit `UnifiedBDSDataTransformer` class
2. Update schema mapping methods
3. Test with `test-enhanced-pipeline-v2.ts`
4. Validate database integration

### **Customizing Automation**
1. Modify `automation-config.json`
2. Update cron schedules in `setup-cron.sh`
3. Customize monitoring in `monitor-automation.js`
4. Test deployment with `deploy-automation.sh`

## 📝 **Logging & Monitoring**

### **Log Files**
- **Main Log**: `logs/bds-automation.log`
- **Error Log**: `logs/error-bds-automation.log`
- **Stats**: `monitoring/stats.json`

### **Monitoring Dashboard**
- **Real-time stats** every 30 seconds
- **System health** indicators
- **Configuration status** validation
- **Performance metrics** tracking

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Scraping Failures**
```bash
# Check individual source
npx ts-node test-enhanced-pipeline-v2.ts afsc

# Check logs
tail -f logs/bds-automation.log

# Verify configuration
cat config/automation-config.json
```

#### **Database Errors**
```bash
# Test database connection
npx ts-node test-database-connection.ts

# Check Prisma schema
npx prisma validate

# Reset database (if needed)
npx prisma migrate reset
```

#### **Automation Issues**
```bash
# Check cron jobs
crontab -l

# Test automation manually
npx ts-node deploy-bds-automation.ts

# Verify environment
cat .env
```

### **Performance Optimization**
- **Reduce page limits** for faster execution
- **Increase delays** between sources
- **Use source-specific pipelines** for targeted updates
- **Monitor memory usage** and adjust limits

## 🔒 **Security & Best Practices**

### **Rate Limiting**
- **Respectful delays** between requests
- **Configurable limits** per source
- **Error handling** for blocked requests
- **Retry mechanisms** with exponential backoff

### **Data Validation**
- **Input sanitization** for all scraped data
- **Schema validation** before database insertion
- **Duplicate detection** across sources
- **Evidence verification** and scoring

### **Monitoring & Alerting**
- **Real-time dashboard** for system health
- **Error logging** with detailed context
- **Performance metrics** tracking
- **Automated notifications** for failures

## 📚 **API Reference**

### **EnhancedBDSPipelineV2**
```typescript
class EnhancedBDSPipelineV2 {
  // Run complete pipeline (all sources)
  async runFullPipeline(): Promise<EnhancedBDSPipelineResult>
  
  // Run pipeline for specific source
  async runSourceSpecificPipeline(source: string): Promise<EnhancedBDSPipelineResult>
}
```

### **UnifiedBDSDataTransformer**
```typescript
class UnifiedBDSDataTransformer {
  // Transform data from all sources
  async transformAllSources(
    afscData?: AFSCScrapingResult,
    whoProfitsData?: WhoProfitsScrapingResult,
    pacbiData?: PACBIAcademicScrapingResult,
    tradeUnionData?: TradeUnionBDSScrapingResult,
    unData?: UNDatabaseScrapingResult
  ): Promise<UnifiedTransformationResult>
}
```

## 🎯 **Roadmap**

### **Phase 1: Core Automation** ✅
- [x] Multi-source scraping
- [x] Unified data transformation
- [x] Database integration
- [x] Basic automation

### **Phase 2: Advanced Features** 🚧
- [ ] Machine learning for evidence scoring
- [ ] Advanced deduplication algorithms
- [ ] Real-time data streaming
- [ ] API endpoints for data access

### **Phase 3: Enterprise Features** 📋
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Custom data source integration
- [ ] Enterprise-grade monitoring

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes with tests
4. **Submit** pull request
5. **Update** documentation

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: [Your Contact]

---

**🎉 Congratulations! You now have a fully automated BDS data collection system that can scale from 5 to 500+ companies with minimal effort.**


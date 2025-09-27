# BDS Data Expansion Roadmap

## 🎯 **Current State vs. Target State**

### **Current Coverage (Limited)**
- **AFSC Investigate**: ~387 companies, 428 evidence items
- **Who Profits**: Basic company database
- **Total Estimated**: 500-800 companies with BDS evidence
- **Coverage**: ~15-25% of companies with BDS involvement

### **Target Coverage (Comprehensive)**
- **Multiple Data Sources**: 8-10 authoritative sources
- **Company Coverage**: 2,000-5,000 companies with BDS evidence
- **Evidence Quality**: High-strength evidence from multiple sources
- **Coverage Goal**: 60-80% of companies with BDS involvement

## 🚀 **Phase 1: Immediate Expansion (This Week)**

### ✅ **Completed**
- Enhanced BDS filtering system with categories
- BDS Movement scraper (corporate campaigns)
- UN Database scraper (settlement reports)
- Enhanced data pipeline combining multiple sources

### 🧪 **Testing Required**
```bash
# Test the enhanced pipeline
cd backend
npx ts-node test-enhanced-bds-pipeline.ts

# Test individual scrapers
npx ts-node test-enhanced-bds-filtering.ts
```

### 📊 **Expected Results**
- **BDS Movement**: 100-300 additional companies
- **UN Database**: 50-150 additional companies
- **Total New**: 150-450 companies
- **Coverage Improvement**: +15-25%

## 🎯 **Phase 2: Additional Sources (Next 2 Weeks)**

### **Priority 1: Academic & Research Sources**
- **University Divestment Lists**
  - Harvard, Stanford, Columbia divestment decisions
  - Student organization campaigns
  - Faculty research on corporate involvement

- **Academic Research Databases**
  - JSTOR, ResearchGate, Academia.edu
  - Peer-reviewed studies on settlements
  - Conference proceedings and reports

### **Priority 2: Financial Institution Lists**
- **Bank Divestment Decisions**
  - European banks (Deutsche Bank, BNP Paribas)
  - US banks (JPMorgan, Goldman Sachs)
  - Asian banks (Mitsubishi UFJ, HSBC)

- **Pension Fund Actions**
  - CalPERS, CalSTRS decisions
  - European pension fund divestments
  - University endowment actions

### **Priority 3: Government & Policy Sources**
- **EU Settlement Guidelines**
  - Companies flagged under EU policy
  - Settlement product labeling
  - Trade restrictions

- **US Government Reports**
  - State Department human rights reports
  - Congressional research on settlements
  - Government contractor involvement

## 🔧 **Phase 3: Advanced Data Collection (Month 2)**

### **Deep Company Profiling**
- **Individual Company Pages**
  - Scrape detailed company profiles
  - Extract specific evidence and dates
  - Cross-reference multiple sources

- **Historical Data Collection**
  - Track changes over time
  - Evidence timeline analysis
  - Company involvement evolution

### **Evidence Validation Pipeline**
- **Source Reliability Scoring**
  - Academic sources: 10/10
  - Government reports: 9/10
  - NGO research: 8/10
  - News media: 6/10
  - Social media: 3/10

- **Cross-Reference Validation**
  - Multiple source confirmation
  - Evidence consistency checking
  - Dispute resolution system

## 📈 **Phase 4: Machine Learning & Automation (Month 3)**

### **Automated Evidence Classification**
- **Natural Language Processing**
  - Automatic BDS category detection
  - Evidence strength assessment
  - Company name extraction

- **Pattern Recognition**
  - Similar company detection
  - Evidence correlation analysis
  - Trend identification

### **Real-Time Updates**
- **Webhook Integration**
  - Source website change detection
  - Automated evidence updates
  - Real-time screening results

- **Scheduled Scraping**
  - Daily/weekly data refresh
  - Incremental updates
  - Change detection and alerts

## 🎯 **Data Source Priority Matrix**

| Source | Priority | Expected Companies | Evidence Quality | Implementation Effort |
|--------|----------|-------------------|------------------|----------------------|
| **BDS Movement** | 🔴 High | 100-300 | Medium | ✅ Complete |
| **UN Database** | 🔴 High | 50-150 | High | ✅ Complete |
| **University Lists** | 🟡 Medium | 200-500 | High | 🔄 In Progress |
| **Bank Divestments** | 🟡 Medium | 100-300 | High | 📋 Planned |
| **Academic Research** | 🟡 Medium | 300-800 | High | 📋 Planned |
| **EU Guidelines** | 🟢 Low | 50-200 | High | 📋 Planned |
| **News Media** | 🟢 Low | 500-1000 | Medium | 📋 Planned |

## 🛠️ **Implementation Strategy**

### **Week 1: Foundation**
- ✅ Enhanced BDS filtering system
- ✅ Multiple data source scrapers
- ✅ Combined data pipeline
- 🧪 Testing and validation

### **Week 2: Additional Sources**
- 📋 University divestment scrapers
- 📋 Financial institution scrapers
- 📋 Government report scrapers
- 🧪 Integration testing

### **Week 3: Data Quality**
- 📋 Evidence validation system
- 📋 Source reliability scoring
- 📋 Cross-reference validation
- 🧪 Quality assurance

### **Week 4: Automation**
- 📋 Scheduled scraping jobs
- 📋 Change detection system
- 📋 Real-time updates
- 🧪 Performance testing

## 📊 **Expected Outcomes**

### **Data Coverage**
- **Before**: 500-800 companies (15-25%)
- **After Phase 1**: 650-1,250 companies (20-35%)
- **After Phase 2**: 1,000-2,000 companies (30-50%)
- **After Phase 3**: 1,500-3,000 companies (45-70%)
- **After Phase 4**: 2,000-5,000 companies (60-80%)

### **Evidence Quality**
- **Before**: Basic evidence with limited categorization
- **After**: Multi-source evidence with reliability scoring
- **Confidence**: High-confidence screening results
- **Transparency**: Clear evidence trail and sources

### **User Experience**
- **Before**: Basic BDS yes/no screening
- **After**: Category-specific filtering with detailed evidence
- **Customization**: User-defined screening criteria
- **Insights**: Trend analysis and company comparisons

## 🚨 **Challenges & Mitigation**

### **Technical Challenges**
- **Rate Limiting**: Implement polite delays and user agents
- **Site Changes**: Build robust selectors and fallback mechanisms
- **Data Volume**: Optimize database queries and indexing
- **Performance**: Implement caching and incremental updates

### **Legal & Ethical Challenges**
- **Terms of Service**: Respect website terms and robots.txt
- **Data Accuracy**: Implement validation and dispute resolution
- **Privacy**: Anonymize personal data and respect privacy
- **Transparency**: Clear source attribution and methodology

### **Operational Challenges**
- **Maintenance**: Regular monitoring and updates
- **Scalability**: Handle increasing data volumes
- **Reliability**: Robust error handling and recovery
- **Documentation**: Comprehensive system documentation

## 🎯 **Success Metrics**

### **Quantitative Metrics**
- **Company Coverage**: Target 60-80% of BDS-involved companies
- **Evidence Quality**: 80%+ high-confidence evidence
- **Source Diversity**: 8-10 authoritative sources
- **Update Frequency**: Daily automated updates

### **Qualitative Metrics**
- **User Satisfaction**: Improved screening accuracy
- **Industry Recognition**: Professional-grade screening system
- **Research Value**: Academic and NGO adoption
- **Transparency**: Clear evidence and methodology

## 🔮 **Future Vision**

### **Short Term (3 months)**
- Comprehensive BDS data coverage
- Professional-grade screening system
- Automated data collection and updates
- Industry-standard accuracy and reliability

### **Medium Term (6 months)**
- Machine learning evidence classification
- Real-time screening updates
- Advanced analytics and insights
- API access for third-party integration

### **Long Term (12 months)**
- Industry-leading BDS screening platform
- Global coverage and recognition
- Research and policy influence
- Sustainable business model

---

## 🚀 **Next Steps**

1. **Test Current System**: Run the enhanced pipeline tests
2. **Validate Data Quality**: Check scraped data accuracy
3. **Plan Additional Sources**: Prioritize next data sources
4. **Implement Automation**: Set up scheduled scraping jobs
5. **Monitor Performance**: Track coverage and quality metrics

*This roadmap will transform EthicCheck from a basic screening tool into a comprehensive, professional-grade BDS screening platform with industry-leading coverage and accuracy.*


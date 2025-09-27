# Data Quality Guide - Preventing Ticker Assignment Issues

## 🚨 What Went Wrong (The KO Incident)

**Problem**: The ticker "KO" was incorrectly assigned to "Adanim Tea Company" instead of "The Coca-Cola Company", causing users searching for "KO" to get the wrong company.

**Root Causes**:
1. **No ticker validation** during data import
2. **Duplicate company records** with different names
3. **Missing ticker assignments** for major companies
4. **No automated quality checks**

## 🛡️ Prevention Systems Implemented

### 1. **TickerValidator Service** (`src/services/ticker-validator.ts`)

**What it does**:
- Validates ticker assignments before saving
- Checks for duplicate ticker conflicts
- Suggests correct tickers based on company names
- Validates ticker format and patterns

**Usage**:
```typescript
import { TickerValidator } from './services/ticker-validator';

const validator = new TickerValidator(prisma);
const result = await validator.validateTickerAssignment('Apple Inc.', 'AAPL');

if (!result.isValid) {
  console.log(`Issue: ${result.reason}`);
  console.log(`Suggested: ${result.suggestedTicker}`);
}
```

### 2. **DataImportGuard Service** (`src/services/data-import-guard.ts`)

**What it does**:
- Validates all company data before import
- Prevents duplicate companies
- Auto-suggests tickers when missing
- Provides safe create/update methods

**Usage**:
```typescript
import { DataImportGuard } from './services/data-import-guard';

const guard = new DataImportGuard(prisma);

// Safe company creation
const result = await guard.createCompanySafely({
  name: 'Apple Inc.',
  country: 'US'
});

if (result.success) {
  console.log(`Company created with ID: ${result.companyId}`);
} else {
  console.log(`Errors: ${result.errors.join(', ')}`);
  console.log(`Warnings: ${result.warnings.join(', ')}`);
}
```

### 3. **Data Quality Monitor** (`monitor-data-quality.ts`)

**What it does**:
- Runs comprehensive data quality checks
- Identifies potential issues before they become problems
- Provides actionable recommendations
- Can be automated in CI/CD pipelines

**Usage**:
```bash
# Run manually
npx ts-node monitor-data-quality.ts

# Run in CI/CD
npm run monitor:data-quality
```

## 📋 Best Practices for Data Import

### 1. **Always Use the Guard Services**

❌ **Don't do this**:
```typescript
// Direct database access without validation
await prisma.company.create({
  data: { name: 'New Company', ticker: 'NEW' }
});
```

✅ **Do this instead**:
```typescript
// Use the guard service
const result = await dataGuard.createCompanySafely({
  name: 'New Company',
  ticker: 'NEW'
});

if (!result.success) {
  throw new Error(`Validation failed: ${result.errors.join(', ')}`);
}
```

### 2. **Validate Tickers Before Assignment**

❌ **Don't do this**:
```typescript
// Assign ticker without checking
company.ticker = 'KO';
```

✅ **Do this instead**:
```typescript
// Validate ticker assignment
const validation = await tickerValidator.validateTickerAssignment(
  company.name, 
  'KO'
);

if (validation.isValid) {
  company.ticker = 'KO';
} else {
  console.log(`Ticker issue: ${validation.reason}`);
  if (validation.suggestedTicker) {
    company.ticker = validation.suggestedTicker;
  }
}
```

### 3. **Check for Similar Companies**

❌ **Don't do this**:
```typescript
// Create company without checking for duplicates
await prisma.company.create({ data: companyData });
```

✅ **Do this instead**:
```typescript
// Use the guard service which checks for duplicates
const result = await dataGuard.createCompanySafely(companyData);

if (result.warnings.length > 0) {
  console.log('Warnings:', result.warnings);
  // Review before proceeding
}
```

## 🔄 Monitoring Schedule

### **Development Environment**
- **Daily**: Run `monitor-data-quality.ts`
- **Before each data import**: Use validation services
- **After each import**: Verify data quality

### **Production Environment**
- **Weekly**: Automated data quality checks
- **Before major imports**: Full validation
- **Alert system**: Notify on critical issues

### **CI/CD Integration**
```yaml
# Example GitHub Actions workflow
- name: Data Quality Check
  run: |
    cd backend
    npm run monitor:data-quality
    
- name: Validate Import Data
  run: |
    cd backend
    npm run validate:import-data
```

## 🚨 Red Flags to Watch For

### **Critical Issues**
1. **Duplicate ticker assignments** - Same ticker on multiple companies
2. **Missing tickers on major companies** - Apple, Microsoft, etc. without tickers
3. **Invalid ticker formats** - Unusual characters or extremely long tickers
4. **Low ticker coverage** - Less than 20% of companies have tickers

### **Warning Signs**
1. **Similar company names** - Potential duplicates
2. **Unusual country names** - Very long or suspicious country values
3. **Missing country information** - Companies without location data
4. **High duplicate count** - More than 10 potential duplicates

## 🛠️ Quick Fixes for Common Issues

### **Fix Duplicate Ticker**
```typescript
// Find companies with duplicate ticker
const duplicates = await prisma.company.findMany({
  where: { ticker: 'DUPLICATE_TICKER' }
});

// Keep the primary company, remove ticker from others
for (let i = 1; i < duplicates.length; i++) {
  await prisma.company.update({
    where: { id: duplicates[i].id },
    data: { ticker: null }
  });
}
```

### **Merge Duplicate Companies**
```typescript
// Find similar companies
const similar = await dataGuard.findSimilarCompanies('Company Name');

if (similar.length > 1) {
  // Merge evidence to primary company
  // Deactivate duplicates
  // Update primary company with correct ticker
}
```

### **Auto-assign Missing Tickers**
```typescript
// Find companies without tickers
const noTickers = await prisma.company.findMany({
  where: { ticker: null, active: true }
});

for (const company of noTickers) {
  const suggested = await tickerValidator.autoAssignTicker(company.name);
  if (suggested) {
    await prisma.company.update({
      where: { id: company.id },
      data: { ticker: suggested }
    });
  }
}
```

## 📊 Quality Metrics to Track

### **Ticker Coverage**
- **Target**: >80% of companies should have tickers
- **Current**: 160/420 = 38% (after our fix)
- **Goal**: Reach 80%+ coverage

### **Duplicate Rate**
- **Target**: <5% of companies should be potential duplicates
- **Current**: Monitor regularly
- **Goal**: Keep below 5%

### **Validation Issues**
- **Target**: 0 high-severity issues
- **Current**: Monitor with `monitor-data-quality.ts`
- **Goal**: Maintain 0 critical issues

## 🔮 Future Improvements

### **Automated Ticker Resolution**
- Integrate with financial APIs (Yahoo Finance, Alpha Vantage)
- Auto-resolve company names to official tickers
- Validate against real-time market data

### **Machine Learning Duplicate Detection**
- Train models to identify duplicate companies
- Fuzzy matching for company names
- Confidence scoring for merge decisions

### **Real-time Validation**
- Validate data as it's entered in the UI
- Immediate feedback on ticker conflicts
- Auto-suggestions in real-time

## 📞 Getting Help

### **When to Escalate**
- Ticker coverage drops below 20%
- More than 20 duplicate companies detected
- Critical validation errors in production
- Data import failures

### **Who to Contact**
- **Data Quality Issues**: Run `monitor-data-quality.ts` first
- **Import Problems**: Use `DataImportGuard` services
- **Ticker Conflicts**: Use `TickerValidator` service
- **System Issues**: Check logs and validation reports

---

**Remember**: Prevention is always better than fixing issues after they occur. Use these services for every data operation to maintain quality and prevent the next "KO incident"!

import { PrismaClient } from '@prisma/client';
import { TickerValidator } from './src/services/ticker-validator';

const prisma = new PrismaClient();

async function analyzeValidationIssues() {
  try {
    console.log('🔍 Analyzing current validation issues for perfect data quality...\n');

    const tickerValidator = new TickerValidator(prisma);
    const validationReport = await tickerValidator.getValidationReport();

    console.log(`📊 Current Validation Status:`);
    console.log(`- Total companies: ${validationReport.totalCompanies}`);
    console.log(`- Companies with tickers: ${validationReport.companiesWithTickers}`);
    console.log(`- Validation issues found: ${validationReport.potentialIssues.length}\n`);

    if (validationReport.potentialIssues.length === 0) {
      console.log('✅ No validation issues found! Data quality is perfect!');
      return;
    }

    // Group issues by type and severity
    const issuesByType = new Map<string, Array<{
      companyName: string;
      ticker: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>>();

    validationReport.potentialIssues.forEach(issue => {
      if (!issuesByType.has(issue.issue)) {
        issuesByType.set(issue.issue, []);
      }
      issuesByType.get(issue.issue)!.push(issue);
    });

    // Display issues grouped by type
    console.log('🚨 Validation Issues Breakdown:\n');
    
    for (const [issueType, issues] of issuesByType) {
      const severityCounts = {
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      };

      console.log(`📋 ${issueType.toUpperCase()}:`);
      console.log(`   Found ${issues.length} companies with this issue:`);
      console.log(`   - High severity: ${severityCounts.high}`);
      console.log(`   - Medium severity: ${severityCounts.medium}`);
      console.log(`   - Low severity: ${severityCounts.low}\n`);
      
      // Show examples of each issue type
      const examples = issues.slice(0, 3); // Show first 3 examples
      examples.forEach(issue => {
        const severityIcon = issue.severity === 'high' ? '🚨' : issue.severity === 'medium' ? '⚠️' : 'ℹ️';
        console.log(`   ${severityIcon} ${issue.companyName} (${issue.ticker})`);
      });
      
      if (issues.length > 3) {
        console.log(`   ... and ${issues.length - 3} more`);
      }
      console.log('');
    }

    // Show severity distribution
    console.log('📊 Severity Distribution:');
    const totalHigh = validationReport.potentialIssues.filter(i => i.severity === 'high').length;
    const totalMedium = validationReport.potentialIssues.filter(i => i.severity === 'medium').length;
    const totalLow = validationReport.potentialIssues.filter(i => i.severity === 'low').length;
    
    console.log(`- High severity: ${totalHigh} issues`);
    console.log(`- Medium severity: ${totalMedium} issues`);
    console.log(`- Low severity: ${totalLow} issues`);
    console.log(`- Total: ${validationReport.potentialIssues.length} issues\n`);

    // Show specific recommendations for each issue type
    console.log('🔧 Fix Recommendations by Issue Type:\n');
    
    for (const [issueType, issues] of issuesByType) {
      console.log(`📝 ${issueType}:`);
      
      if (issueType.includes('Invalid ticker format')) {
        console.log(`   - These tickers don't follow standard format rules`);
        console.log(`   - Tickers should be 1-10 characters, uppercase letters/numbers only`);
        console.log(`   - Action: Shorten or reformat tickers to meet standards\n`);
      } else if (issueType.includes('Expected ticker')) {
        console.log(`   - These companies have tickers that don't match their names`);
        console.log(`   - Consider updating to the suggested tickers for consistency`);
        console.log(`   - Action: Review and update tickers to match company names\n`);
      } else {
        console.log(`   - Review these issues for data quality improvements`);
        console.log(`   - Action: Investigate and resolve based on specific issue type\n`);
      }
    }

    // Show companies that need immediate attention
    console.log('🔥 High Priority - Companies Needing Immediate Attention:\n');
    const highPriorityIssues = validationReport.potentialIssues.filter(issue => issue.severity === 'high');
    
    if (highPriorityIssues.length > 0) {
      highPriorityIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.companyName}`);
        console.log(`   Ticker: ${issue.ticker}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log('');
      });
    } else {
      console.log('✅ No high-priority issues found!');
    }

    // Show fix strategy
    console.log('🎯 Recommended Fix Strategy:');
    console.log('1. Fix high-severity issues first (immediate impact)');
    console.log('2. Address medium-severity issues (quality improvement)');
    console.log('3. Review low-severity issues (polish)');
    console.log('4. Run validation again to confirm fixes');
    console.log('5. Monitor for new issues');

    console.log('\n💡 Next Steps:');
    console.log('1. Create fix script for high-severity issues');
    console.log('2. Execute fixes systematically');
    console.log('3. Verify improvements with monitoring');
    console.log('4. Achieve perfect data quality!');

  } catch (error) {
    console.error('❌ Error analyzing validation issues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeValidationIssues();


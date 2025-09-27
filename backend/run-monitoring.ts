#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { AutomatedMonitor } from './src/services/automated-monitor';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  const monitor = new AutomatedMonitor(prisma);

  try {
    switch (command) {
      case 'full':
      case '--full':
        console.log('🔍 Running full monitoring...');
        const report = await monitor.runMonitoring();
        await monitor.sendReport(report);
        break;

      case 'quick':
      case '--quick':
        console.log('⚡ Running quick health check...');
        const health = await monitor.quickHealthCheck();
        console.log(`\n📊 Quick Health Check Results:`);
        console.log(`Healthy: ${health.healthy ? '✅ Yes' : '❌ No'}`);
        console.log(`Critical Issues: ${health.issues}`);
        break;

      case 'metrics':
      case '--metrics':
        console.log('📊 Running metrics collection...');
        const fullReport = await monitor.runMonitoring();
        console.log('\n📈 Key Metrics:');
        console.log(`- Total Companies: ${fullReport.metrics.totalCompanies}`);
        console.log(`- Companies with Tickers: ${fullReport.metrics.companiesWithTickers}`);
        console.log(`- Ticker Coverage: ${fullReport.metrics.tickerCoverage.toFixed(1)}%`);
        console.log(`- Potential Duplicates: ${fullReport.metrics.potentialDuplicates}`);
        console.log(`- Validation Issues: ${fullReport.metrics.validationIssues}`);
        console.log(`- Critical Issues: ${fullReport.metrics.criticalIssues}`);
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error running monitoring:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function showHelp() {
  console.log(`
🔍 Automated Data Quality Monitoring

Usage: npx ts-node run-monitoring.ts [command]

Commands:
  full, --full     Run comprehensive monitoring (default)
  quick, --quick   Run quick health check only
  metrics, --metrics Show key metrics summary
  help, --help, -h Show this help message

Examples:
  npx ts-node run-monitoring.ts          # Run full monitoring
  npx ts-node run-monitoring.ts quick    # Quick health check
  npx ts-node run-monitoring.ts metrics  # Show metrics only

Exit Codes:
  0 - Success, no critical issues
  1 - Error or critical issues detected
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

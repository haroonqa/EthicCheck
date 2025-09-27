import { PrismaClient } from '@prisma/client';
import { DataImportGuard } from './data-import-guard';
import { TickerValidator } from './ticker-validator';

export interface MonitoringAlert {
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  companyId?: string;
  ticker?: string;
  actionRequired: boolean;
}

export interface MonitoringReport {
  timestamp: Date;
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  metrics: {
    totalCompanies: number;
    companiesWithTickers: number;
    tickerCoverage: number;
    potentialDuplicates: number;
    validationIssues: number;
    criticalIssues: number;
  };
  alerts: MonitoringAlert[];
  recommendations: string[];
}

export class AutomatedMonitor {
  private prisma: PrismaClient;
  private dataGuard: DataImportGuard;
  private tickerValidator: TickerValidator;

  // Thresholds for alerts
  private static THRESHOLDS = {
    TICKER_COVERAGE_CRITICAL: 20,    // Below 20% = critical
    TICKER_COVERAGE_WARNING: 50,     // Below 50% = warning
    DUPLICATES_CRITICAL: 20,         // Above 20 = critical
    DUPLICATES_WARNING: 10,          // Above 10 = warning
    VALIDATION_CRITICAL: 10,         // Above 10 = critical
    VALIDATION_WARNING: 5            // Above 5 = warning
  };

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.dataGuard = new DataImportGuard(prisma);
    this.tickerValidator = new TickerValidator(prisma);
  }

  /**
   * Run comprehensive automated monitoring
   */
  async runMonitoring(): Promise<MonitoringReport> {
    const timestamp = new Date();
    const alerts: MonitoringAlert[] = [];
    const recommendations: string[] = [];

    try {
      console.log('🔍 Starting automated monitoring...');

      // Get quality metrics
      const qualityReport = await this.dataGuard.getDataQualityReport();
      const tickerReport = await this.tickerValidator.getValidationReport();

      // Check ticker coverage
      if (qualityReport.tickerCoverage < AutomatedMonitor.THRESHOLDS.TICKER_COVERAGE_CRITICAL) {
        alerts.push({
          level: 'critical',
          title: 'Critical: Very Low Ticker Coverage',
          message: `Only ${qualityReport.tickerCoverage.toFixed(1)}% of companies have tickers. This severely limits frontend functionality.`,
          timestamp,
          actionRequired: true
        });
        recommendations.push('Immediately assign tickers to major companies');
      } else if (qualityReport.tickerCoverage < AutomatedMonitor.THRESHOLDS.TICKER_COVERAGE_WARNING) {
        alerts.push({
          level: 'warning',
          title: 'Warning: Low Ticker Coverage',
          message: `Ticker coverage is ${qualityReport.tickerCoverage.toFixed(1)}%. Consider improving coverage for better user experience.`,
          timestamp,
          actionRequired: false
        });
        recommendations.push('Review companies without tickers and assign where appropriate');
      }

      // Check for duplicates
      if (qualityReport.potentialDuplicates > AutomatedMonitor.THRESHOLDS.DUPLICATES_CRITICAL) {
        alerts.push({
          level: 'critical',
          title: 'Critical: High Duplicate Count',
          message: `${qualityReport.potentialDuplicates} potential duplicate companies detected. This can cause user confusion.`,
          timestamp,
          actionRequired: true
        });
        recommendations.push('Immediately review and merge duplicate companies');
      } else if (qualityReport.potentialDuplicates > AutomatedMonitor.THRESHOLDS.DUPLICATES_WARNING) {
        alerts.push({
          level: 'warning',
          title: 'Warning: Duplicate Companies Detected',
          message: `${qualityReport.potentialDuplicates} potential duplicate companies found.`,
          timestamp,
          actionRequired: false
        });
        recommendations.push('Review duplicate companies and merge as needed');
      }

      // Check validation issues
      const criticalValidationIssues = tickerReport.potentialIssues.filter(issue => issue.severity === 'high');
      if (criticalValidationIssues.length > AutomatedMonitor.THRESHOLDS.VALIDATION_CRITICAL) {
        alerts.push({
          level: 'critical',
          title: 'Critical: High Validation Issues',
          message: `${criticalValidationIssues.length} high-severity validation issues found.`,
          timestamp,
          actionRequired: true
        });
        recommendations.push('Fix high-severity validation issues immediately');
      } else if (criticalValidationIssues.length > AutomatedMonitor.THRESHOLDS.VALIDATION_WARNING) {
        alerts.push({
          level: 'warning',
          title: 'Warning: Validation Issues Detected',
          message: `${criticalValidationIssues.length} high-severity validation issues found.`,
          timestamp,
          actionRequired: false
        });
        recommendations.push('Review and fix validation issues');
      }

      // Check for major companies without tickers
      const majorCompaniesWithoutTickers = await this.checkMajorCompaniesWithoutTickers();
      if (majorCompaniesWithoutTickers.length > 0) {
        alerts.push({
          level: 'warning',
          title: 'Major Companies Missing Tickers',
          message: `${majorCompaniesWithoutTickers.length} major companies are missing tickers: ${majorCompaniesWithoutTickers.slice(0, 3).join(', ')}${majorCompaniesWithoutTickers.length > 3 ? '...' : ''}`,
          timestamp,
          actionRequired: false
        });
        recommendations.push('Assign tickers to major companies for better coverage');
      }

      // Check for duplicate ticker assignments
      const duplicateTickers = await this.checkDuplicateTickerAssignments();
      if (duplicateTickers.length > 0) {
        alerts.push({
          level: 'critical',
          title: 'Critical: Duplicate Ticker Assignments',
          message: `${duplicateTickers.length} tickers are assigned to multiple companies. This will cause frontend lookup failures.`,
          timestamp,
          actionRequired: true
        });
        recommendations.push('Immediately resolve duplicate ticker assignments');
      }

      // Determine overall health
      const overallHealth = this.calculateOverallHealth(alerts);

      // Generate additional recommendations based on metrics
      if (qualityReport.tickerCoverage < 80) {
        recommendations.push('Work towards 80%+ ticker coverage for comprehensive screening');
      }

      if (qualityReport.potentialDuplicates > 0) {
        recommendations.push('Implement duplicate detection in data import processes');
      }

      if (tickerReport.potentialIssues.length > 0) {
        recommendations.push('Review ticker validation rules and improve data quality');
      }

      const report: MonitoringReport = {
        timestamp,
        overallHealth,
        metrics: {
          totalCompanies: qualityReport.totalCompanies,
          companiesWithTickers: qualityReport.companiesWithTickers,
          tickerCoverage: qualityReport.tickerCoverage,
          potentialDuplicates: qualityReport.potentialDuplicates,
          validationIssues: tickerReport.potentialIssues.length,
          criticalIssues: alerts.filter(a => a.level === 'critical').length
        },
        alerts,
        recommendations
      };

      console.log(`✅ Monitoring completed. Overall health: ${overallHealth}`);
      return report;

    } catch (error) {
      console.error('❌ Error during monitoring:', error);
      
      // Create error alert
      const errorAlert: MonitoringAlert = {
        level: 'critical',
        title: 'Monitoring System Error',
        message: `Automated monitoring failed: ${error}`,
        timestamp,
        actionRequired: true
      };

      return {
        timestamp,
        overallHealth: 'critical',
        metrics: {
          totalCompanies: 0,
          companiesWithTickers: 0,
          tickerCoverage: 0,
          potentialDuplicates: 0,
          validationIssues: 0,
          criticalIssues: 1
        },
        alerts: [errorAlert],
        recommendations: ['Check monitoring system logs and fix underlying issues']
      };
    }
  }

  /**
   * Check for major companies without tickers
   */
  private async checkMajorCompaniesWithoutTickers(): Promise<string[]> {
    const majorCompanyNames = [
      'Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'Meta', 'Netflix',
      'IBM', 'Intel', 'Cisco', 'Oracle', 'Adobe', 'Salesforce', 'Palantir'
    ];

    const companiesWithoutTickers = await this.prisma.company.findMany({
      where: {
        active: true,
        ticker: null,
        OR: majorCompanyNames.map(name => ({
          name: { contains: name, mode: 'insensitive' }
        }))
      },
      select: { name: true }
    });

    return companiesWithoutTickers.map(c => c.name);
  }

  /**
   * Check for duplicate ticker assignments
   */
  private async checkDuplicateTickerAssignments(): Promise<Array<{ticker: string, companies: string[]}>> {
    const result = await this.prisma.$queryRaw`
      SELECT ticker, array_agg(name) as companies
      FROM company 
      WHERE ticker IS NOT NULL AND active = true
      GROUP BY ticker 
      HAVING COUNT(*) > 1
      ORDER BY ticker
    `;

    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        ticker: item.ticker,
        companies: item.companies
      }));
    }

    return [];
  }

  /**
   * Calculate overall health based on alerts
   */
  private calculateOverallHealth(alerts: MonitoringAlert[]): 'excellent' | 'good' | 'warning' | 'critical' {
    const criticalCount = alerts.filter(a => a.level === 'critical').length;
    const warningCount = alerts.filter(a => a.level === 'warning').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 2) return 'warning';
    if (warningCount > 0) return 'good';
    return 'excellent';
  }

  /**
   * Send monitoring report (placeholder for integration with notification systems)
   */
  async sendReport(report: MonitoringReport): Promise<void> {
    // This is a placeholder - integrate with your preferred notification system
    // Examples: Slack, email, webhook, etc.
    
    console.log('\n📊 Monitoring Report Generated:');
    console.log(`Overall Health: ${report.overallHealth.toUpperCase()}`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Alerts: ${report.alerts.length} (${report.alerts.filter(a => a.level === 'critical').length} critical)`);
    
    if (report.alerts.length > 0) {
      console.log('\n🚨 Alerts:');
      report.alerts.forEach(alert => {
        const icon = alert.level === 'critical' ? '🚨' : alert.level === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${alert.title}: ${alert.message}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`- ${rec}`));
    }

    // TODO: Integrate with notification systems
    // await this.sendSlackNotification(report);
    // await this.sendEmailAlert(report);
    // await this.sendWebhook(report);
  }

  /**
   * Quick health check (for frequent monitoring)
   */
  async quickHealthCheck(): Promise<{healthy: boolean; issues: number}> {
    try {
      const report = await this.runMonitoring();
      const criticalIssues = report.alerts.filter(a => a.level === 'critical').length;
      
      return {
        healthy: criticalIssues === 0,
        issues: criticalIssues
      };
    } catch (error) {
      return { healthy: false, issues: 1 };
    }
  }
}

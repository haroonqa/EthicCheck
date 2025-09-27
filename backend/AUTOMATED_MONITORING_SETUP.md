# 🚀 Automated Data Quality Monitoring Setup Guide

This guide will help you set up automated monitoring for your data quality system to prevent future ticker assignment issues.

## 📋 What You'll Get

✅ **Automated daily monitoring** at 9 AM  
✅ **Weekly comprehensive checks** on Sundays at 10 AM  
✅ **CI/CD integration** with GitHub Actions  
✅ **Automated alerts** for critical issues  
✅ **Logging and reporting** for all monitoring activities  
✅ **Quick health checks** for immediate feedback  

## 🛠️ Setup Steps

### 1. **Install Dependencies**

First, make sure you have the required dependencies:

```bash
cd backend
npm install ts-node typescript @types/node
```

### 2. **Test the Monitoring System**

Test that everything works before setting up automation:

```bash
# Test full monitoring
npx ts-node run-monitoring.ts

# Test quick health check
npx ts-node run-monitoring.ts quick

# Test metrics only
npx ts-node run-monitoring.ts metrics
```

### 3. **Set Up Automated Cron Jobs**

Run the setup script to create automated monitoring:

```bash
# Make the script executable and run it
chmod +x setup-monitoring-cron.sh
./setup-monitoring-cron.sh
```

This will:
- Create monitoring scripts in your backend directory
- Set up cron jobs for daily and weekly monitoring
- Create a logs directory for monitoring results
- Configure everything to run automatically

### 4. **Add Monitoring Scripts to package.json**

Add these scripts to your `backend/package.json`:

```json
{
  "scripts": {
    "monitor": "ts-node run-monitoring.ts",
    "monitor:quick": "ts-node run-monitoring.ts quick",
    "monitor:metrics": "ts-node run-monitoring.ts metrics",
    "monitor:setup": "chmod +x setup-monitoring-cron.sh && ./setup-monitoring-cron.sh",
    "monitor:logs": "tail -f ../logs/monitoring/monitor-daily.log",
    "monitor:logs-weekly": "tail -f ../logs/monitoring/monitor-weekly.log",
    "monitor:status": "crontab -l | grep -E '(monitor|monitoring)' || echo 'No monitoring cron jobs found'"
  }
}
```

### 5. **Set Up GitHub Actions (Optional)**

Copy the `.github/workflows/data-quality-monitoring.yml` file to your repository to enable CI/CD monitoring.

## 📅 Monitoring Schedule

### **Daily Monitoring (9:00 AM)**
- Full data quality assessment
- Ticker coverage check
- Duplicate detection
- Validation issue review
- Logs saved to `logs/monitoring/monitor-daily.log`

### **Weekly Monitoring (Sunday 10:00 AM)**
- Comprehensive data audit
- Trend analysis
- Detailed recommendations
- Logs saved to `logs/monitoring/monitor-weekly.log`

### **Manual Monitoring**
```bash
# Full monitoring
npm run monitor

# Quick health check
npm run monitor:quick

# Metrics only
npm run monitor:metrics
```

## 🔍 What Gets Monitored

### **Critical Issues (Immediate Action Required)**
- Ticker coverage below 20%
- Duplicate ticker assignments
- More than 20 potential duplicate companies
- More than 10 high-severity validation issues

### **Warning Issues (Review Recommended)**
- Ticker coverage below 50%
- 10+ potential duplicate companies
- 5+ high-severity validation issues
- Major companies missing tickers

### **Metrics Tracked**
- Total companies in database
- Companies with tickers
- Ticker coverage percentage
- Potential duplicate count
- Validation issue count
- Overall system health

## 📊 Understanding the Results

### **Health Levels**
- 🟢 **Excellent**: No issues detected
- 🟡 **Good**: Minor warnings, no critical issues
- 🟠 **Warning**: Multiple warnings, review recommended
- 🔴 **Critical**: Critical issues requiring immediate action

### **Exit Codes**
- `0`: Success, no critical issues
- `1`: Error or critical issues detected

## 🚨 Alert System

### **Current Alerts (Console)**
- Critical issues displayed with 🚨
- Warnings displayed with ⚠️
- Info messages displayed with ℹ️
- Detailed recommendations provided

### **Future Alert Integrations**
The system is designed to integrate with:
- **Slack**: Webhook notifications
- **Email**: SMTP alerts
- **Webhooks**: Custom notification endpoints
- **SMS**: Text message alerts

## 📋 Monitoring Commands Reference

```bash
# Setup and Management
npm run monitor:setup          # Set up automated monitoring
npm run monitor:status         # Check monitoring cron jobs

# Manual Monitoring
npm run monitor                # Full monitoring
npm run monitor:quick          # Quick health check
npm run monitor:metrics        # Metrics summary

# Logs and Reports
npm run monitor:logs           # View daily monitoring logs
npm run monitor:logs-weekly    # View weekly monitoring logs
```

## 🔧 Customization

### **Adjust Monitoring Thresholds**
Edit `src/services/automated-monitor.ts` to change alert thresholds:

```typescript
private static THRESHOLDS = {
  TICKER_COVERAGE_CRITICAL: 20,    // Below 20% = critical
  TICKER_COVERAGE_WARNING: 50,     // Below 50% = warning
  DUPLICATES_CRITICAL: 20,         // Above 20 = critical
  DUPLICATES_WARNING: 10,          // Above 10 = warning
  VALIDATION_CRITICAL: 10,         // Above 10 = critical
  VALIDATION_WARNING: 5            // Above 5 = warning
};
```

### **Change Monitoring Schedule**
Edit `setup-monitoring-cron.sh` to change when monitoring runs:

```bash
# Daily monitoring at 9 AM
add_cron_job "0 9 * * *" "$SCRIPT_DIR/monitor-daily.sh" "Daily monitoring (9 AM)"

# Weekly monitoring on Sundays at 10 AM
add_cron_job "0 10 * * 0" "$SCRIPT_DIR/monitor-weekly.sh" "Weekly monitoring (Sunday 10 AM)"
```

### **Add Custom Checks**
Extend the `AutomatedMonitor` class in `src/services/automated-monitor.ts` to add your own monitoring logic.

## 🚀 Advanced Features

### **CI/CD Integration**
The GitHub Actions workflow automatically:
- Runs monitoring on code changes
- Comments on pull requests with results
- Fails builds if critical issues detected
- Generates artifacts for review

### **Log Management**
- Automatic log rotation (keeps last 1000 lines)
- Structured logging with timestamps
- Separate logs for different monitoring types
- Easy log viewing and analysis

### **Health Metrics**
- Trend analysis over time
- Performance tracking
- Issue resolution tracking
- Coverage improvement monitoring

## 🆘 Troubleshooting

### **Common Issues**

#### **Monitoring Script Not Found**
```bash
# Ensure you're in the backend directory
cd backend
ls -la run-monitoring.ts
```

#### **Permission Denied**
```bash
# Make scripts executable
chmod +x *.sh
chmod +x run-monitoring.ts
```

#### **Cron Jobs Not Running**
```bash
# Check cron service
sudo service cron status

# View cron logs
sudo tail -f /var/log/cron

# Check your crontab
crontab -l
```

#### **Database Connection Issues**
```bash
# Check environment variables
echo $DATABASE_URL

# Test database connection
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('✅ DB connected')).catch(console.error);
"
```

### **Getting Help**

1. **Check the logs**: `npm run monitor:logs`
2. **Run manual monitoring**: `npm run monitor`
3. **Verify cron jobs**: `npm run monitor:status`
4. **Review setup**: Check `setup-monitoring-cron.sh` output

## 🎯 Success Metrics

### **Immediate Benefits**
- ✅ Automated issue detection
- ✅ No more manual quality checks
- ✅ Early warning system
- ✅ Consistent monitoring

### **Long-term Benefits**
- 🚀 Improved data quality
- 🛡️ Prevention of future issues
- 📊 Better user experience
- 🔍 Proactive problem resolution

## 🔮 Future Enhancements

- **Real-time monitoring** with webhooks
- **Machine learning** for issue prediction
- **Advanced analytics** and trend reporting
- **Integration** with external monitoring tools
- **Custom alert rules** for your team

---

## 🎉 You're All Set!

Your automated data quality monitoring system is now configured to:

1. **Run automatically** every day and week
2. **Alert you immediately** to critical issues
3. **Provide detailed reports** on data quality
4. **Integrate seamlessly** with your development workflow
5. **Prevent future ticker issues** before they reach users

**Remember**: The system will now catch issues like the "KO incident" automatically, ensuring your ethical screening platform maintains high quality and reliability! 🚀

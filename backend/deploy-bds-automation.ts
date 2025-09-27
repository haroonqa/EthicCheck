import { EnhancedBDSPipelineV2 } from './src/services/enhanced-bds-pipeline-v2';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface AutomationConfig {
  schedule: {
    fullPipeline: string; // cron expression
    individualSources: string[];
    sourceRotation: string[];
  };
  limits: {
    maxPagesPerRun: number;
    maxCompaniesPerSource: number;
    delayBetweenSources: number; // milliseconds
  };
  notifications: {
    enabled: boolean;
    webhookUrl?: string;
    emailRecipients?: string[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    filePath: string;
    maxFileSize: string;
    retentionDays: number;
  };
}

class BDSAutomationDeployer {
  private config: AutomationConfig;
  private pipeline: EnhancedBDSPipelineV2;

  constructor() {
    this.config = this.getDefaultConfig();
    this.pipeline = new EnhancedBDSPipelineV2();
  }

  private getDefaultConfig(): AutomationConfig {
    return {
      schedule: {
        fullPipeline: '0 2 * * *', // Daily at 2 AM
        individualSources: ['afsc', 'whoprofits', 'pacbi', 'tradeunion', 'undatabase'],
        sourceRotation: ['afsc', 'whoprofits', 'pacbi', 'tradeunion', 'undatabase']
      },
      limits: {
        maxPagesPerRun: 10,
        maxCompaniesPerSource: 100,
        delayBetweenSources: 5000 // 5 seconds
      },
      notifications: {
        enabled: true,
        webhookUrl: process.env.BDS_WEBHOOK_URL,
        emailRecipients: process.env.BDS_EMAIL_RECIPIENTS?.split(',') || []
      },
      logging: {
        level: 'info',
        filePath: './logs/bds-automation.log',
        maxFileSize: '10MB',
        retentionDays: 30
      }
    };
  }

  async deployAutomation() {
    console.log('🚀 Deploying BDS Automation System...');
    console.log('=====================================\n');

    try {
      // 1. Create necessary directories
      this.createDirectories();

      // 2. Generate configuration files
      this.generateConfigFiles();

      // 3. Generate deployment scripts
      this.generateDeploymentScripts();

      // 4. Generate monitoring dashboard
      this.generateMonitoringDashboard();

      // 5. Test automation components
      await this.testAutomationComponents();

      console.log('\n✅ BDS Automation System Deployed Successfully!');
      console.log('================================================');
      console.log('📁 Generated Files:');
      console.log('   - automation-config.json');
      console.log('   - deploy-automation.sh');
      console.log('   - monitor-automation.js');
      console.log('   - README-automation.md');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Review automation-config.json');
      console.log('   2. Run: chmod +x deploy-automation.sh');
      console.log('   3. Execute: ./deploy-automation.sh');
      console.log('   4. Monitor with: node monitor-automation.js');

    } catch (error) {
      console.error('❌ Automation deployment failed:', error);
      throw error;
    }
  }

  private createDirectories() {
    console.log('📁 Creating automation directories...');
    
    const dirs = [
      './logs',
      './config',
      './scripts',
      './monitoring'
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      } else {
        console.log(`   ℹ️  Exists: ${dir}`);
      }
    });
  }

  private generateConfigFiles() {
    console.log('\n⚙️  Generating configuration files...');

    // Main automation config
    const configPath = './config/automation-config.json';
    writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`   ✅ Generated: ${configPath}`);

    // Environment template
    const envTemplate = `# BDS Automation Environment Variables
BDS_WEBHOOK_URL=https://your-webhook-url.com/bds-updates
BDS_EMAIL_RECIPIENTS=admin@example.com,analyst@example.com
BDS_DATABASE_URL=your-database-connection-string
BDS_LOG_LEVEL=info
BDS_MAX_PAGES=10
BDS_DELAY_BETWEEN_SOURCES=5000
`;
    
    const envPath = './config/.env.template';
    writeFileSync(envPath, envTemplate);
    console.log(`   ✅ Generated: ${envPath}`);
  }

  private generateDeploymentScripts() {
    console.log('\n📜 Generating deployment scripts...');

    // Main deployment script
    const deployScript = `#!/bin/bash

echo "🚀 Deploying BDS Automation System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create log directory
mkdir -p logs

# Set up environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp config/.env.template .env
    echo "⚠️  Please edit .env file with your configuration before running automation."
fi

# Test automation
echo "🧪 Testing automation components..."
npx ts-node test-enhanced-pipeline-v2.ts afsc

echo "✅ BDS Automation System deployed successfully!"
echo "📖 See README-automation.md for usage instructions."
`;

    const deployPath = './deploy-automation.sh';
    writeFileSync(deployPath, deployScript);
    console.log(`   ✅ Generated: ${deployPath}`);

    // Cron job setup script
    const cronScript = `#!/bin/bash

echo "⏰ Setting up BDS Automation Cron Jobs..."

# Add cron job for daily full pipeline
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && npx ts-node src/services/enhanced-bds-pipeline-v2.ts full") | crontab -

# Add cron job for hourly individual source rotation
(crontab -l 2>/dev/null; echo "0 * * * * cd $(pwd) && npx ts-node src/services/enhanced-bds-pipeline-v2.ts rotate") | crontab -

echo "✅ Cron jobs configured:"
echo "   - Daily full pipeline at 2 AM"
echo "   - Hourly source rotation"
echo ""
echo "📋 Current cron jobs:"
crontab -l
`;

    const cronPath = './setup-cron.sh';
    writeFileSync(cronPath, cronScript);
    console.log(`   ✅ Generated: ${cronPath}`);
  }

  private generateMonitoringDashboard() {
    console.log('\n📊 Generating monitoring dashboard...');

    const monitorScript = `const fs = require('fs');
const path = require('path');

class BDSAutomationMonitor {
  constructor() {
    this.logFile = './logs/bds-automation.log';
    this.configFile = './config/automation-config.json';
    this.statsFile = './monitoring/stats.json';
  }

  async startMonitoring() {
    console.log('📊 BDS Automation Monitor Started');
    console.log('==================================\\n');

    // Load configuration
    const config = this.loadConfig();
    
    // Start monitoring loop
    setInterval(() => {
      this.updateDashboard();
    }, 30000); // Update every 30 seconds

    // Initial dashboard
    this.updateDashboard();
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configFile, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('❌ Error loading config:', error);
      return {};
    }
  }

  updateDashboard() {
    const stats = this.collectStats();
    this.displayDashboard(stats);
    this.saveStats(stats);
  }

  collectStats() {
    const stats = {
      timestamp: new Date().toISOString(),
      logFileSize: this.getFileSize(this.logFile),
      lastLogEntry: this.getLastLogEntry(),
      configStatus: this.checkConfigStatus(),
      systemStatus: this.checkSystemStatus()
    };

    return stats;
  }

  getFileSize(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2) + ' KB';
      }
      return 'N/A';
    } catch (error) {
      return 'Error';
    }
  }

  getLastLogEntry() {
    try {
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        const lines = content.split('\\n').filter(line => line.trim());
        return lines[lines.length - 1] || 'No log entries';
      }
      return 'No log file';
    } catch (error) {
      return 'Error reading log';
    }
  }

  checkConfigStatus() {
    try {
      const config = this.loadConfig();
      return {
        valid: true,
        sources: config.schedule?.individualSources?.length || 0,
        schedule: config.schedule?.fullPipeline || 'Not configured'
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  checkSystemStatus() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      uptime: (process.uptime() / 60).toFixed(2) + ' minutes'
    };
  }

  displayDashboard(stats) {
    console.clear();
    console.log('📊 BDS Automation Monitor Dashboard');
    console.log('====================================');
    console.log(\`⏰ Last Updated: \${stats.timestamp}\\n\`);
    
    console.log('📁 System Status:');
    console.log(\`   Node.js: \${stats.systemStatus.nodeVersion}\`);
    console.log(\`   Platform: \${stats.systemStatus.platform}\`);
    console.log(\`   Memory: \${stats.systemStatus.memory}\`);
    console.log(\`   Uptime: \${stats.systemStatus.uptime}\\n\`);
    
    console.log('⚙️  Configuration:');
    console.log(\`   Status: \${stats.configStatus.valid ? '✅ Valid' : '❌ Invalid'}\`);
    console.log(\`   Sources: \${stats.configStatus.sources}\`);
    console.log(\`   Schedule: \${stats.configStatus.schedule}\\n\`);
    
    console.log('📝 Logging:');
    console.log(\`   Log File: \${stats.logFileSize}\`);
    console.log(\`   Last Entry: \${stats.lastLogEntry.substring(0, 80)}...\\n\`);
    
    console.log('🔄 Auto-refresh every 30 seconds. Press Ctrl+C to exit.');
  }

  saveStats(stats) {
    try {
      const statsDir = path.dirname(this.statsFile);
      if (!fs.existsSync(statsDir)) {
        fs.mkdirSync(statsDir, { recursive: true });
      }
      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('❌ Error saving stats:', error);
    }
  }
}

// Start monitoring
const monitor = new BDSAutomationMonitor();
monitor.startMonitoring();
`;

    const monitorPath = './monitoring/monitor-automation.js';
    writeFileSync(monitorPath, monitorScript);
    console.log(`   ✅ Generated: ${monitorPath}`);
  }

  private async testAutomationComponents() {
    console.log('\n🧪 Testing automation components...');

    try {
      // Test individual source pipeline
      console.log('   Testing AFSC source pipeline...');
      const result = await this.pipeline.runSourceSpecificPipeline('afsc');
      
      if (result.totalCompaniesScraped > 0) {
        console.log(`   ✅ AFSC pipeline working: ${result.totalCompaniesScraped} companies`);
      } else {
        console.log('   ⚠️  AFSC pipeline returned no companies');
      }

      console.log('   ✅ All automation components tested successfully!');

    } catch (error) {
      console.log(`   ❌ Component test failed: ${error}`);
      throw error;
    }
  }
}

// Deploy automation if run directly
if (require.main === module) {
  const deployer = new BDSAutomationDeployer();
  deployer.deployAutomation().catch(console.error);
}

export { BDSAutomationDeployer };


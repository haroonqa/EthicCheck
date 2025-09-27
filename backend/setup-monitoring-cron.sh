#!/bin/bash

# Automated Data Quality Monitoring Setup Script
# This script sets up cron jobs for automated monitoring

echo "🔍 Setting up Automated Data Quality Monitoring..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if we're in the right directory
if [ ! -f "$SCRIPT_DIR/run-monitoring.ts" ]; then
    echo "❌ Error: run-monitoring.ts not found in $SCRIPT_DIR"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Create monitoring logs directory
MONITORING_LOGS="$PROJECT_ROOT/logs/monitoring"
mkdir -p "$MONITORING_LOGS"

echo "📁 Created monitoring logs directory: $MONITORING_LOGS"

# Function to add cron job
add_cron_job() {
    local schedule="$1"
    local command="$2"
    local description="$3"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$command"; then
        echo "⚠️  Cron job already exists for: $description"
        return
    fi
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$schedule $command") | crontab -
    echo "✅ Added cron job: $description"
}

# Function to create monitoring script
create_monitoring_script() {
    local script_name="$1"
    local schedule="$2"
    local log_file="$MONITORING_LOGS/$script_name.log"
    
    cat > "$SCRIPT_DIR/$script_name.sh" << EOF
#!/bin/bash

# Automated monitoring script - $schedule
# Generated on $(date)

cd "$SCRIPT_DIR"
export PATH="/usr/local/bin:/usr/bin:/bin:\$PATH"

# Run monitoring and log results
echo "\$(date): Starting $schedule monitoring..." >> "$log_file"
npx ts-node run-monitoring.ts >> "$log_file" 2>&1
EXIT_CODE=\$?

# Log completion
echo "\$(date): Monitoring completed with exit code \$EXIT_CODE" >> "$log_file"

# Keep only last 1000 lines to prevent log bloat
tail -1000 "$log_file" > "${log_file}.tmp" && mv "${log_file}.tmp" "$log_file"

# Exit with monitoring result code
exit \$EXIT_CODE
EOF

    chmod +x "$SCRIPT_DIR/$script_name.sh"
    echo "📝 Created monitoring script: $script_name.sh"
}

# Create monitoring scripts
echo "📝 Creating monitoring scripts..."

create_monitoring_script "monitor-daily" "daily"
create_monitoring_script "monitor-weekly" "weekly"
create_monitoring_script "monitor-hourly" "hourly"

# Set up cron jobs
echo "⏰ Setting up cron jobs..."

# Daily monitoring at 9 AM
add_cron_job "0 9 * * *" "$SCRIPT_DIR/monitor-daily.sh" "Daily monitoring (9 AM)"

# Weekly monitoring on Sundays at 10 AM
add_cron_job "0 10 * * 0" "$SCRIPT_DIR/monitor-weekly.sh" "Weekly monitoring (Sunday 10 AM)"

# Hourly quick health check (optional - uncomment if needed)
# add_cron_job "0 * * * *" "$SCRIPT_DIR/monitor-hourly.sh" "Hourly health check"

echo ""
echo "✅ Automated monitoring setup complete!"
echo ""
echo "📋 Cron Jobs Created:"
echo "  - Daily: 9:00 AM - Full monitoring report"
echo "  - Weekly: Sunday 10:00 AM - Comprehensive check"
echo "  - Logs: $MONITORING_LOGS"
echo ""
echo "🔍 Manual Monitoring Commands:"
echo "  npx ts-node run-monitoring.ts          # Full monitoring"
echo "  npx ts-node run-monitoring.ts quick    # Quick health check"
echo "  npx ts-node run-monitoring.ts metrics  # Metrics only"
echo ""
echo "📊 View Current Cron Jobs:"
echo "  crontab -l"
echo ""
echo "📝 Edit Cron Jobs:"
echo "  crontab -e"
echo ""
echo "📋 View Monitoring Logs:"
echo "  tail -f $MONITORING_LOGS/monitor-daily.log"
echo "  tail -f $MONITORING_LOGS/monitor-weekly.log"
echo ""
echo "🚨 Monitoring will run automatically and log results to:"
echo "  $MONITORING_LOGS"

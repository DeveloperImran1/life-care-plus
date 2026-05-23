#!/bin/bash

# Winston Logger Quick Reference
# This script provides quick commands for managing and monitoring logs

echo "🔍 Winston Logger - Quick Reference"
echo "===================================="
echo ""

# Show menu
show_menu() {
    echo "Available Commands:"
    echo ""
    echo "Monitoring:"
    echo "  1. tail-combined      - Monitor all logs"
    echo "  2. tail-errors        - Monitor errors only"
    echo "  3. tail-success       - Monitor success logs"
    echo "  4. tail-debug         - Monitor debug logs"
    echo ""
    echo "Analysis:"
    echo "  5. count-errors       - Count error entries"
    echo "  6. count-warns        - Count warning entries"
    echo "  7. latest-50          - Show latest 50 log entries"
    echo "  8. search             - Search logs by pattern"
    echo ""
    echo "Maintenance:"
    echo "  9. list-logs          - List all log files"
    echo "  10. log-sizes         - Show log file sizes"
    echo "  11. backup-logs       - Backup logs to archive"
    echo "  12. clean-old-logs    - Delete logs older than 30 days"
    echo ""
    echo "Usage: source logs-cli.sh && COMMAND_NAME"
    echo ""
}

# Monitoring functions
alias tail-combined='tail -f logs/combined.log'
alias tail-errors='tail -f logs/error.log'
alias tail-success='tail -f logs/success.log'
alias tail-debug='tail -f logs/debug.log'

# Analysis functions
count-errors() {
    echo "Error count: $(grep -c 'ERROR' logs/error.log 2>/dev/null || echo '0')"
}

count-warns() {
    echo "Warning count: $(grep -c 'WARN' logs/error.log 2>/dev/null || echo '0')"
}

latest-50() {
    tail -50 logs/combined.log
}

search() {
    if [ -z "$1" ]; then
        echo "Usage: search 'pattern'"
        return 1
    fi
    echo "Searching for: $1"
    grep -n "$1" logs/combined.log | head -20
}

# Maintenance functions
list-logs() {
    echo "Log files:"
    ls -la logs/
}

log-sizes() {
    echo "Log file sizes:"
    du -sh logs/*
}

backup-logs() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    echo "Creating backup: logs-backup-$TIMESTAMP.tar.gz"
    tar -czf "logs-backup-$TIMESTAMP.tar.gz" logs/
    echo "✅ Backup created successfully"
}

clean-old-logs() {
    echo "Removing logs older than 30 days..."
    find logs/ -name "*.log" -mtime +30 -delete
    echo "✅ Cleanup complete"
}

# Show menu if no arguments
if [ -z "$1" ]; then
    show_menu
fi

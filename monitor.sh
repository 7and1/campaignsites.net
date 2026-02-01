#!/bin/bash
# CampaignSites.net Monitoring Script
# Usage: ./monitor.sh [command] [options]
#
# Features:
#   - Health endpoint checks
#   - Error rate monitoring
#   - Performance metrics
#   - Queue depth monitoring
#   - Alert on issues
#   - Continuous monitoring mode

set -e
set -o pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_NAME="campaignsites"
ENVIRONMENT="${CLOUDFLARE_ENV:-production}"
DEPLOYMENT_URL="${DEPLOYMENT_URL:-https://campaignsites.net}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/campaignsites-deploy"
MONITOR_LOG="$LOG_DIR/monitor-$(date +%Y%m%d-%H%M%S).log"

# Monitoring thresholds
RESPONSE_TIME_WARNING=1000  # ms
RESPONSE_TIME_CRITICAL=3000  # ms
ERROR_RATE_WARNING=5  # percentage
ERROR_RATE_CRITICAL=10  # percentage

# Alert configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
ALERT_EMAIL="${ALERT_EMAIL:-}"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$MONITOR_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$MONITOR_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$MONITOR_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$MONITOR_LOG"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$MONITOR_LOG"
}

# Send alert
send_alert() {
    local severity=$1  # info, warning, critical
    local message=$2

    local emoji="ℹ️"
    case "$severity" in
        warning) emoji="⚠️" ;;
        critical) emoji="🚨" ;;
        success) emoji="✅" ;;
    esac

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji [$PROJECT_NAME] $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi

    # Discord notification
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"$emoji [$PROJECT_NAME] $message\"}" \
            "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
}

# Check health endpoint
check_health() {
    log_step "Checking health endpoint..."

    local url="${DEPLOYMENT_URL}/api/health"
    local start_time=$(date +%s%3N)

    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time 10 "$url" 2>/dev/null || echo -e "\n000\n0")
    local body=$(echo "$response" | head -n -2)
    local status=$(echo "$response" | tail -n 2 | head -n 1)
    local time_total=$(echo "$response" | tail -n 1)

    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))

    # Check HTTP status
    if [ "$status" = "200" ]; then
        log_success "Health check passed (HTTP $status)"

        # Parse health check response
        if command -v jq &> /dev/null && [ -n "$body" ]; then
            local health_status=$(echo "$body" | jq -r '.status' 2>/dev/null || echo "unknown")
            local checks=$(echo "$body" | jq -r '.checks | to_entries[] | "\(.key): \(.value.status)"' 2>/dev/null || echo "")

            log_info "Status: $health_status"
            if [ -n "$checks" ]; then
                echo "$checks" | while read -r line; do
                    log_info "  $line"
                done
            fi
        fi

        # Check response time
        log_info "Response time: ${response_time}ms"

        if [ "$response_time" -gt "$RESPONSE_TIME_CRITICAL" ]; then
            log_error "Response time critical (>${RESPONSE_TIME_CRITICAL}ms)"
            send_alert "critical" "Response time critical: ${response_time}ms"
            return 2
        elif [ "$response_time" -gt "$RESPONSE_TIME_WARNING" ]; then
            log_warning "Response time high (>${RESPONSE_TIME_WARNING}ms)"
            send_alert "warning" "Response time high: ${response_time}ms"
            return 1
        else
            log_success "Response time good"
        fi

        return 0
    else
        log_error "Health check failed (HTTP $status)"
        send_alert "critical" "Health check failed: HTTP $status"
        return 2
    fi
}

# Check critical endpoints
check_endpoints() {
    log_step "Checking critical endpoints..."

    local endpoints=(
        "/:Homepage"
        "/api/health:Health API"
        "/tools:Tools Page"
        "/blog:Blog Page"
    )

    local failed=0
    local total=${#endpoints[@]}

    for endpoint_info in "${endpoints[@]}"; do
        local path=$(echo "$endpoint_info" | cut -d':' -f1)
        local name=$(echo "$endpoint_info" | cut -d':' -f2)
        local url="${DEPLOYMENT_URL}${path}"

        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

        if [ "$status" = "200" ] || [ "$status" = "307" ] || [ "$status" = "308" ]; then
            log_info "✓ $name ($status)"
        else
            log_warning "✗ $name ($status)"
            failed=$((failed + 1))
        fi
    done

    local success=$((total - failed))
    log_info "Endpoints: $success/$total passed"

    if [ $failed -gt 0 ]; then
        send_alert "warning" "$failed/$total endpoints failing"
        return 1
    fi

    return 0
}

# Check performance metrics
check_performance() {
    log_step "Checking performance metrics..."

    local url="$DEPLOYMENT_URL"

    # Measure multiple requests
    local total_time=0
    local requests=5
    local failed=0

    for i in $(seq 1 $requests); do
        local start_time=$(date +%s%3N)
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))

        if [ "$status" = "200" ]; then
            total_time=$((total_time + response_time))
        else
            failed=$((failed + 1))
        fi
    done

    if [ $failed -eq $requests ]; then
        log_error "All performance checks failed"
        send_alert "critical" "All performance checks failed"
        return 2
    fi

    local successful=$((requests - failed))
    local avg_time=$((total_time / successful))

    log_info "Average response time: ${avg_time}ms (${successful}/${requests} requests)"

    if [ "$avg_time" -gt "$RESPONSE_TIME_CRITICAL" ]; then
        log_error "Average response time critical"
        send_alert "critical" "Average response time: ${avg_time}ms"
        return 2
    elif [ "$avg_time" -gt "$RESPONSE_TIME_WARNING" ]; then
        log_warning "Average response time high"
        send_alert "warning" "Average response time: ${avg_time}ms"
        return 1
    else
        log_success "Performance metrics good"
    fi

    return 0
}

# Check error rates
check_error_rates() {
    log_step "Checking error rates..."

    # This would integrate with Cloudflare Analytics API
    # For now, we'll check recent logs

    log_info "Error rate monitoring requires Cloudflare Analytics API integration"
    log_info "Monitor in Cloudflare Dashboard:"
    log_info "  https://dash.cloudflare.com → Workers & Pages → $PROJECT_NAME → Analytics"

    # Check if wrangler can fetch logs
    if command -v wrangler &> /dev/null; then
        log_info "Checking recent logs for errors..."

        # This would need to be implemented with proper log parsing
        # wrangler pages deployment tail --project-name="$PROJECT_NAME" --format=json
    fi
}

# Check queue depth
check_queue_depth() {
    log_step "Checking queue depth..."

    if ! command -v wrangler &> /dev/null; then
        log_warning "Wrangler not found, skipping queue check"
        return 0
    fi

    if ! wrangler whoami &> /dev/null; then
        log_warning "Not authenticated with Cloudflare, skipping queue check"
        return 0
    fi

    # Check email queue
    local queue_name="email-queue"

    log_info "Checking queue: $queue_name"

    # Note: Queue depth monitoring would require Cloudflare API integration
    # For now, we'll just verify the queue exists

    if wrangler queues list 2>/dev/null | grep -q "$queue_name"; then
        log_success "Queue '$queue_name' exists"
    else
        log_warning "Queue '$queue_name' not found"
    fi
}

# Check database
check_database() {
    log_step "Checking database..."

    if ! command -v wrangler &> /dev/null; then
        log_warning "Wrangler not found, skipping database check"
        return 0
    fi

    if ! wrangler whoami &> /dev/null; then
        log_warning "Not authenticated with Cloudflare, skipping database check"
        return 0
    fi

    local database_name="campaign-db"

    if wrangler d1 execute "$database_name" --command "SELECT 1" --env="$ENVIRONMENT" --remote &> /dev/null; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
        send_alert "critical" "Database connection failed"
        return 1
    fi
}

# Run all checks
run_all_checks() {
    log_info "========================================"
    log_info "Running all monitoring checks..."
    log_info "========================================"
    echo ""

    local total_checks=0
    local passed_checks=0
    local warnings=0
    local errors=0

    # Health check
    total_checks=$((total_checks + 1))
    if check_health; then
        passed_checks=$((passed_checks + 1))
    elif [ $? -eq 1 ]; then
        warnings=$((warnings + 1))
    else
        errors=$((errors + 1))
    fi
    echo ""

    # Endpoints check
    total_checks=$((total_checks + 1))
    if check_endpoints; then
        passed_checks=$((passed_checks + 1))
    else
        warnings=$((warnings + 1))
    fi
    echo ""

    # Performance check
    total_checks=$((total_checks + 1))
    if check_performance; then
        passed_checks=$((passed_checks + 1))
    elif [ $? -eq 1 ]; then
        warnings=$((warnings + 1))
    else
        errors=$((errors + 1))
    fi
    echo ""

    # Error rates check
    check_error_rates
    echo ""

    # Queue check
    check_queue_depth
    echo ""

    # Database check
    total_checks=$((total_checks + 1))
    if check_database; then
        passed_checks=$((passed_checks + 1))
    else
        errors=$((errors + 1))
    fi
    echo ""

    # Summary
    log_info "========================================"
    log_info "Monitoring Summary"
    log_info "========================================"
    log_info "Total checks: $total_checks"
    log_success "Passed: $passed_checks"
    if [ $warnings -gt 0 ]; then
        log_warning "Warnings: $warnings"
    fi
    if [ $errors -gt 0 ]; then
        log_error "Errors: $errors"
    fi
    log_info "========================================"

    if [ $errors -gt 0 ]; then
        return 2
    elif [ $warnings -gt 0 ]; then
        return 1
    else
        return 0
    fi
}

# Continuous monitoring
continuous_monitor() {
    local interval=${1:-60}  # seconds

    log_info "Starting continuous monitoring (interval: ${interval}s)"
    log_info "Press Ctrl+C to stop"
    echo ""

    while true; do
        run_all_checks

        echo ""
        log_info "Next check in ${interval}s..."
        sleep "$interval"
        echo ""
        echo "========================================"
        echo ""
    done
}

# Show monitoring status
show_status() {
    log_step "Monitoring Status"

    echo ""
    echo "Configuration:"
    echo "  Project: $PROJECT_NAME"
    echo "  Environment: $ENVIRONMENT"
    echo "  URL: $DEPLOYMENT_URL"
    echo "  Response time warning: ${RESPONSE_TIME_WARNING}ms"
    echo "  Response time critical: ${RESPONSE_TIME_CRITICAL}ms"
    echo ""

    run_all_checks
}

# Show help
show_help() {
    cat << EOF
CampaignSites.net Monitoring Script

Usage: $0 [command] [options]

Commands:
  check            Run all monitoring checks (default)
  health           Check health endpoint only
  endpoints        Check critical endpoints only
  performance      Check performance metrics only
  errors           Check error rates
  queue            Check queue depth
  database         Check database connection
  watch [interval] Continuous monitoring (default: 60s)
  status           Show monitoring status
  --help, -h       Show this help message

Examples:
  $0                    Run all checks once
  $0 health             Check health endpoint
  $0 watch              Continuous monitoring (60s interval)
  $0 watch 30           Continuous monitoring (30s interval)
  $0 status             Show monitoring status

Environment Variables:
  DEPLOYMENT_URL              Override deployment URL
  CLOUDFLARE_ENV              Override environment
  SLACK_WEBHOOK_URL           Slack webhook for alerts
  DISCORD_WEBHOOK_URL         Discord webhook for alerts
  RESPONSE_TIME_WARNING       Warning threshold in ms (default: 1000)
  RESPONSE_TIME_CRITICAL      Critical threshold in ms (default: 3000)

For more information, see DEPLOYMENT.md
EOF
}

# Handle script arguments
case "${1:-check}" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    check|all)
        run_all_checks
        ;;
    health)
        check_health
        ;;
    endpoints)
        check_endpoints
        ;;
    performance|perf)
        check_performance
        ;;
    errors)
        check_error_rates
        ;;
    queue)
        check_queue_depth
        ;;
    database|db)
        check_database
        ;;
    watch|monitor)
        continuous_monitor "${2:-60}"
        ;;
    status)
        show_status
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

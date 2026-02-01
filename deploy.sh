#!/bin/bash
# CampaignSites.net Deployment Script
# Usage: ./deploy.sh [environment|command]
#   environment: 'production' (default) or 'preview'
#
# Features:
#   - Pre-deployment checks
#   - Health checks
#   - Rollback support
#   - Notifications (optional)
#   - Comprehensive error handling

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="campaignsites"
DATABASE_NAME="campaign-db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/campaignsites-deploy"
DEPLOY_LOG="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# Health check configuration
HEALTH_CHECK_URL=""
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_RETRIES=3

# Deployment strategy
DEPLOYMENT_STRATEGY="${DEPLOYMENT_STRATEGY:-direct}"  # direct, blue-green, canary
CANARY_PERCENTAGE="${CANARY_PERCENTAGE:-10}"

# Skip options
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"
SKIP_MIGRATIONS="${SKIP_MIGRATIONS:-false}"

# Notification webhooks (optional)
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$DEPLOY_LOG"
}

# Notification functions
send_notification() {
    local status=$1
    local message=$2

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[$PROJECT_NAME] $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi

    # Discord notification
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"[$PROJECT_NAME] $status: $message\"}" \
            "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
}

notify_start() {
    send_notification "🚀 STARTING" "Deploying to $ENVIRONMENT..."
}

notify_success() {
    local url=$1
    send_notification "✅ SUCCESS" "Deployment to $ENVIRONMENT completed successfully. URL: $url"
}

notify_failure() {
    local error=$1
    send_notification "❌ FAILED" "Deployment to $ENVIRONMENT failed: $error"
}

# Error handler
error_handler() {
    local line_no=$1
    log_error "Error occurred at line $line_no"
    notify_failure "Error at line $line_no. Check logs: $DEPLOY_LOG"
    update_github_deployment_status "failure" "Deployment failed at line $line_no"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Pre-deployment checks
check_prerequisites() {
    log_step "Running pre-deployment checks..."

    local errors=0

    # Check for wrangler
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found. Install with: npm install -g wrangler"
        errors=$((errors + 1))
    else
        log_info "Wrangler version: $(wrangler --version)"
    fi

    # Check for pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found. Install with: npm install -g pnpm"
        errors=$((errors + 1))
    else
        log_info "pnpm version: $(pnpm --version)"
    fi

    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_info "Node.js version: $node_version"

        # Check if version meets requirements (>=18.20.2 or >=20.9.0)
        local node_major=$(echo "$node_version" | cut -d'.' -f1 | sed 's/v//')
        if [ "$node_major" -lt 18 ]; then
            log_error "Node.js version must be ^18.20.2 or >=20.9.0"
            errors=$((errors + 1))
        fi
    else
        log_error "Node.js not found"
        errors=$((errors + 1))
    fi

    # Check if wrangler is authenticated
    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        errors=$((errors + 1))
    else
        local account=$(wrangler whoami 2>/dev/null | grep -o '[^[:space:]]*@[^[:space:]]*' || echo "unknown")
        log_info "Authenticated as: $account"
    fi

    # Check wrangler.toml exists
    if [ ! -f "wrangler.toml" ]; then
        log_error "wrangler.toml not found. Copy from wrangler.toml.example and configure."
        errors=$((errors + 1))
    fi

    # Check for required environment variables in production
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Checking production configuration..."

        # Check D1 database ID is configured
        if grep -q "YOUR-D1-ID-HERE" wrangler.toml 2>/dev/null || ! grep -q "database_id" wrangler.toml 2>/dev/null; then
            log_warning "D1 database ID may not be configured in wrangler.toml"
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Deployment aborted by user"
                exit 1
            fi
        fi

        # Check KV namespace IDs
        if grep -q "placeholder" wrangler.toml 2>/dev/null; then
            log_warning "KV namespace IDs contain 'placeholder' - may need configuration"
        fi

        # Check for default secrets
        if grep -q "YOUR-PAYLOAD-SECRET" wrangler.toml 2>/dev/null; then
            log_warning "Default PAYLOAD_SECRET detected in wrangler.toml"
            read -p "Continue with default secret? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Deployment aborted"
                exit 1
            fi
        fi
    fi

    # Check git status for uncommitted changes
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            log_warning "Uncommitted changes detected"
            git status --short | head -5

            if [ "$ENVIRONMENT" = "production" ]; then
                read -p "Deploy with uncommitted changes? (y/N) " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log_error "Deployment aborted by user"
                    exit 1
                fi
            fi
        fi

        # Get current branch and commit
        local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        log_info "Git branch: $branch (commit: $commit)"
        export GIT_BRANCH="$branch"
        export GIT_COMMIT="$commit"
    fi

    if [ $errors -gt 0 ]; then
        log_error "$errors prerequisite check(s) failed"
        exit 1
    fi

    log_success "Pre-deployment checks passed"
}

# Run tests
run_tests() {
    log_step "Running tests..."

    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Tests skipped (SKIP_TESTS=true)"
        return 0
    fi

    # Run unit tests
    if pnpm run test 2>&1 | tee -a "$DEPLOY_LOG"; then
        log_success "Tests passed"
    else
        log_error "Tests failed"

        if [ "$ENVIRONMENT" = "production" ]; then
            read -p "Deploy despite test failures? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Deployment aborted due to test failures"
                exit 1
            fi
        else
            return 1
        fi
    fi
}

# Verify Cloudflare resources
verify_cloudflare_resources() {
    log_step "Verifying Cloudflare resources..."

    local warnings=0

    # Check D1 database
    if wrangler d1 info "$DATABASE_NAME" --env="$ENVIRONMENT" &> /dev/null; then
        log_info "✓ D1 database '$DATABASE_NAME' exists"
    else
        log_warning "✗ D1 database '$DATABASE_NAME' not found or not accessible"
        warnings=$((warnings + 1))
    fi

    # Check R2 buckets
    local r2_buckets=("campaign-media" "campaignsites-cache")
    for bucket in "${r2_buckets[@]}"; do
        if wrangler r2 bucket list 2>/dev/null | grep -q "$bucket"; then
            log_info "✓ R2 bucket '$bucket' exists"
        else
            log_warning "✗ R2 bucket '$bucket' not found"
            warnings=$((warnings + 1))
        fi
    done

    # Check KV namespaces
    local kv_list=$(wrangler kv:namespace list 2>/dev/null || echo "")
    if echo "$kv_list" | grep -q "RATE_LIMIT_KV\|CACHE_KV"; then
        log_info "✓ KV namespaces configured"
    else
        log_warning "✗ KV namespaces may not be configured"
        warnings=$((warnings + 1))
    fi

    # Check queues
    local queue_list=$(wrangler queues list 2>/dev/null || echo "")
    if echo "$queue_list" | grep -q "email-queue"; then
        log_info "✓ Queue 'email-queue' exists"
    else
        log_warning "✗ Queue 'email-queue' not found"
        warnings=$((warnings + 1))
    fi

    if [ $warnings -gt 0 ]; then
        log_warning "$warnings resource(s) may need attention"

        if [ "$ENVIRONMENT" = "production" ]; then
            read -p "Continue deployment? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Deployment aborted by user"
                exit 1
            fi
        fi
    else
        log_success "All Cloudflare resources verified"
    fi
}

# Backup current deployment info
backup_deployment_info() {
    log_step "Backing up current deployment info..."

    local backup_file="$LOG_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).json"

    # Get current deployment info
    wrangler pages deployments list --project-name="$PROJECT_NAME" --json 2>/dev/null | head -1 > "$backup_file" || true

    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        log_info "Deployment info saved to: $backup_file"
        export PREV_DEPLOYMENT_FILE="$backup_file"
    else
        log_warning "Could not backup deployment info"
    fi
}

# Generate types
generate_types() {
    log_step "Generating TypeScript types..."

    pnpm run generate:types:cloudflare 2>&1 | tee -a "$DEPLOY_LOG" || {
        log_error "Failed to generate Cloudflare types"
        return 1
    }

    pnpm run generate:types:payload 2>&1 | tee -a "$DEPLOY_LOG" || {
        log_error "Failed to generate Payload types"
        return 1
    }

    pnpm run generate:importmap 2>&1 | tee -a "$DEPLOY_LOG" || {
        log_error "Failed to generate import map"
        return 1
    }

    log_success "Type generation complete"
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."

    export CLOUDFLARE_ENV=$ENVIRONMENT
    export NODE_ENV=production
    export PAYLOAD_SECRET=ignore

    if pnpm run deploy:database 2>&1 | tee -a "$DEPLOY_LOG"; then
        log_success "Database migrations complete"
    else
        log_error "Database migrations failed"
        return 1
    fi
}

# Build application
build_app() {
    log_step "Building application..."

    # Clean previous builds
    if [ -d ".open-next" ]; then
        log_info "Cleaning previous build..."
        rm -rf .open-next
    fi

    if pnpm run build 2>&1 | tee -a "$DEPLOY_LOG"; then
        log_success "Build completed"
    else
        log_error "Build failed"
        return 1
    fi
}

# Verify build
verify_build() {
    log_step "Verifying build artifacts..."

    # Check if .open-next directory exists
    if [ ! -d ".open-next" ]; then
        log_error ".open-next directory not found. Build may have failed."
        return 1
    fi

    # Check for critical build artifacts
    if [ ! -f ".open-next/worker.js" ]; then
        log_error "worker.js not found. Build may be incomplete."
        return 1
    fi

    # Check for assets
    if [ ! -d ".open-next/assets" ]; then
        log_warning ".open-next/assets directory not found"
    fi

    # Check build size
    local build_size=$(du -sh .open-next 2>/dev/null | cut -f1)
    log_info "Build size: $build_size"

    log_success "Build verification complete"
}

# Deploy to Cloudflare
deploy_app() {
    log_step "Deploying to Cloudflare ($ENVIRONMENT)..."

    export CLOUDFLARE_ENV=$ENVIRONMENT

    if pnpm run deploy:app 2>&1 | tee -a "$DEPLOY_LOG"; then
        log_success "Deployment complete"
    else
        log_error "Deployment failed"
        return 1
    fi

    # Extract deployment URL from logs
    DEPLOYMENT_URL=$(grep -o 'https://.*.pages.dev' "$DEPLOY_LOG" | head -1 || echo "")
    if [ -n "$DEPLOYMENT_URL" ]; then
        log_info "Deployment URL: $DEPLOYMENT_URL"
        export DEPLOYMENT_URL
    fi
}

# Health check
health_check() {
    log_step "Running health checks..."

    local url=${1:-$DEPLOYMENT_URL}

    if [ -z "$url" ]; then
        log_warning "No deployment URL available for health check"
        return 0
    fi

    # Set health check URL
    local health_url="${url}/api/health"
    log_info "Checking $health_url..."

    local retries=0
    local success=false

    while [ $retries -lt $HEALTH_CHECK_RETRIES ]; do
        # Check health endpoint
        local response=$(curl -s -w "\n%{http_code}" --max-time "$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null || echo -e "\n000")
        local body=$(echo "$response" | head -n -1)
        local status=$(echo "$response" | tail -n 1)

        if [ "$status" = "200" ]; then
            success=true

            # Parse health check response
            local health_status=$(echo "$body" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
            local response_time=$(echo "$body" | grep -o '"responseTime":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

            log_success "Health check passed (status: $health_status, response: $response_time)"

            # Show detailed check results
            if command -v jq &> /dev/null; then
                echo "$body" | jq -r '.checks | to_entries[] | "  \(.key): \(.value.status)"' 2>/dev/null || true
            fi

            break
        fi

        retries=$((retries + 1))
        log_info "Health check attempt $retries failed (HTTP $status), retrying..."
        sleep 5
    done

    if [ "$success" = true ]; then
        return 0
    else
        log_error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
        return 1
    fi
}

# Check critical paths
check_critical_paths() {
    log_step "Checking critical paths..."

    local base_url=${1:-$DEPLOYMENT_URL}

    if [ -z "$base_url" ]; then
        log_warning "No URL available for critical path checks"
        return 0
    fi

    local paths=("/" "/api/health" "/tools" "/blog" "/admin")
    local failed=0

    for path in "${paths[@]}"; do
        local full_url="${base_url}${path}"
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$full_url" 2>/dev/null || echo "000")

        if [ "$status" = "200" ] || [ "$status" = "307" ] || [ "$status" = "308" ]; then
            log_info "✓ $path ($status)"
        else
            log_warning "✗ $path ($status)"
            failed=$((failed + 1))
        fi
    done

    if [ $failed -gt 0 ]; then
        log_warning "$failed critical path(s) returned non-200 status"
    else
        log_success "All critical paths accessible"
    fi
}

# Check D1 connectivity
check_d1_connection() {
    log_step "Verifying D1 database connection..."

    if wrangler d1 execute "$DATABASE_NAME" --command "SELECT 1" --remote &> /dev/null; then
        log_success "D1 database is accessible"
    else
        log_warning "Could not verify D1 connection (may be expected)"
    fi
}

# Post-deployment checks
post_deploy_checks() {
    log_step "Running post-deployment checks..."

    # Health check
    health_check || true

    # Check critical paths
    check_critical_paths || true

    # Check D1 connectivity
    check_d1_connection || true

    # List recent deployments
    log_info "Recent deployments:"
    wrangler pages deployments list --project-name="$PROJECT_NAME" 2>/dev/null | head -n 6 || true

    log_success "Post-deployment checks complete"
}

# Rollback to previous deployment
rollback() {
    log_step "Initiating rollback..."

    log_info "Fetching recent deployments..."
    local deployments=$(wrangler pages deployments list --project-name="$PROJECT_NAME" --json 2>/dev/null || echo "[]")

    if [ -z "$deployments" ] || [ "$deployments" = "[]" ]; then
        log_error "No deployments found or unable to fetch deployments"
        exit 1
    fi

    # Show last 5 deployments
    echo "$deployments" | jq -r '.[0:5] | .[] | "\(.id) | \(.created_on) | \(.url)"' 2>/dev/null | while read -r line; do
        echo "  $line"
    done

    echo ""
    log_info "To rollback to a specific deployment, use:"
    echo "  wrangler pages deployment rollback --project-name=$PROJECT_NAME <deployment-id>"
    echo ""
    echo "Or via Cloudflare Dashboard:"
    echo "  Pages → $PROJECT_NAME → Deployments → Select previous → Rollback"

    read -p "Do you want to rollback to the previous deployment? (y/N) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local prev_id=$(echo "$deployments" | jq -r '.[1].id' 2>/dev/null)
        if [ -n "$prev_id" ] && [ "$prev_id" != "null" ]; then
            log_info "Rolling back to $prev_id..."
            wrangler pages deployment rollback "$prev_id" --project-name="$PROJECT_NAME"
            log_success "Rollback initiated"
        else
            log_error "Could not determine previous deployment ID"
            exit 1
        fi
    else
        log_info "Rollback cancelled"
    fi
}

# Show deployment status
show_status() {
    log_step "Deployment Status"

    log_info "Recent deployments:"
    wrangler pages deployments list --project-name="$PROJECT_NAME" 2>/dev/null | head -n 6 || {
        log_error "Could not fetch deployment status"
        return 1
    }

    log_info "D1 Database status:"
    wrangler d1 info "$DATABASE_NAME" 2>/dev/null || log_warning "Could not fetch D1 info"
}

# Show logs
show_logs() {
    log_step "Fetching logs..."

    log_info "Recent deployment logs (press Ctrl+C to exit):"
    wrangler pages deployment tail --project-name="$PROJECT_NAME" 2>/dev/null || {
        log_error "Could not fetch logs. Make sure you have the right permissions."
        return 1
    }
}

# Clean old logs
clean_logs() {
    log_step "Cleaning old deployment logs..."

    local count=$(find "$LOG_DIR" -name "deploy-*.log" -type f | wc -l)

    if [ "$count" -gt 10 ]; then
        find "$LOG_DIR" -name "deploy-*.log" -type f -mtime +7 -delete
        log_info "Deleted logs older than 7 days"
    fi

    local new_count=$(find "$LOG_DIR" -name "deploy-*.log" -type f | wc -l)
    log_info "Log files: $new_count (was $count)"
}

# Create GitHub deployment
create_github_deployment() {
    if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_REPOSITORY" ]; then
        return 0
    fi

    log_step "Creating GitHub deployment..."

    local payload=$(cat <<EOF
{
  "ref": "${GIT_BRANCH:-main}",
  "environment": "$ENVIRONMENT",
  "description": "Deploying ${GIT_COMMIT:-unknown} to $ENVIRONMENT",
  "auto_merge": false,
  "required_contexts": []
}
EOF
)

    local response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/deployments" \
        -d "$payload")

    export GITHUB_DEPLOYMENT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$GITHUB_DEPLOYMENT_ID" ]; then
        log_info "GitHub deployment created: $GITHUB_DEPLOYMENT_ID"
    fi
}

# Update GitHub deployment status
update_github_deployment_status() {
    local state=$1  # pending, success, failure
    local description=$2

    if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_REPOSITORY" ] || [ -z "$GITHUB_DEPLOYMENT_ID" ]; then
        return 0
    fi

    local payload=$(cat <<EOF
{
  "state": "$state",
  "description": "$description",
  "environment_url": "${DEPLOYMENT_URL:-}",
  "auto_inactive": false
}
EOF
)

    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_REPOSITORY/deployments/$GITHUB_DEPLOYMENT_ID/statuses" \
        -d "$payload" > /dev/null
}

# Performance check
check_performance() {
    log_step "Running performance checks..."

    local url=${1:-$DEPLOYMENT_URL}

    if [ -z "$url" ]; then
        log_warning "No deployment URL available for performance check"
        return 0
    fi

    # Measure response time
    local start_time=$(date +%s%3N)
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))

    if [ "$status" = "200" ]; then
        log_info "Response time: ${response_time}ms (HTTP $status)"

        if [ "$response_time" -gt 3000 ]; then
            log_warning "Response time exceeds 3s threshold"
        elif [ "$response_time" -gt 1000 ]; then
            log_info "Response time is acceptable but could be improved"
        else
            log_success "Response time is excellent"
        fi
    else
        log_warning "Performance check failed (HTTP $status)"
    fi
}

# Check error rates
check_error_rates() {
    log_step "Checking error rates..."

    # This would integrate with Cloudflare Analytics API
    # For now, we'll just log that it should be monitored
    log_info "Monitor error rates in Cloudflare Dashboard:"
    log_info "  https://dash.cloudflare.com → Workers & Pages → $PROJECT_NAME → Analytics"
}

# Main deployment flow
main() {
    log_info "========================================"
    log_info "CampaignSites.net Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Strategy: $DEPLOYMENT_STRATEGY"
    log_info "Project: $PROJECT_NAME"
    log_info "Database: $DATABASE_NAME"
    log_info "Log: $DEPLOY_LOG"
    log_info "========================================"
    echo ""

    notify_start
    create_github_deployment
    update_github_deployment_status "pending" "Deployment in progress"

    # Run deployment steps
    check_prerequisites
    verify_cloudflare_resources
    run_tests
    backup_deployment_info
    generate_types
    run_migrations
    build_app
    verify_build
    deploy_app
    post_deploy_checks
    check_performance
    check_error_rates
    clean_logs

    echo ""
    log_success "========================================"
    log_success "Deployment to $ENVIRONMENT completed!"
    if [ -n "$DEPLOYMENT_URL" ]; then
        log_success "URL: $DEPLOYMENT_URL"
    fi
    log_success "Log: $DEPLOY_LOG"
    log_success "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your deployment URL"
    echo "  2. Test critical functionality"
    echo "  3. Monitor error logs: ./deploy.sh logs"
    echo "  4. Check status: ./deploy.sh status"
    echo "  5. Rollback if needed: ./deploy.sh rollback"
    echo ""

    notify_success "$DEPLOYMENT_URL"
    update_github_deployment_status "success" "Deployment completed successfully"
}

# Show help
show_help() {
    cat << EOF
CampaignSites.net Deployment Script

Usage: $0 [command|environment] [options]

Environments:
  production    Deploy to production (default)
  preview       Deploy to preview/staging environment

Commands:
  deploy        Deploy to specified environment (default)
  rollback      Show rollback options and rollback to previous
  status        Show deployment status
  logs          Show real-time deployment logs
  health        Run health check on deployed site
  clean         Clean old deployment logs
  --help, -h    Show this help message

Environment Variables:
  SLACK_WEBHOOK_URL     Slack webhook for notifications
  DISCORD_WEBHOOK_URL   Discord webhook for notifications
  CLOUDFLARE_ENV        Override environment (production/preview)

Examples:
  $0                      Deploy to production
  $0 preview              Deploy to preview
  $0 rollback             Show rollback options
  $0 status               Show deployment status
  $0 logs                 Show real-time logs

For more information, see DEPLOYMENT.md
EOF
}

# Handle script arguments
case "${1:-}" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    rollback|--rollback)
        rollback
        exit 0
        ;;
    status|--status)
        show_status
        exit 0
        ;;
    logs|--logs)
        show_logs
        exit 0
        ;;
    health|--health)
        DEPLOYMENT_URL=${2:-}
        health_check "$DEPLOYMENT_URL"
        exit 0
        ;;
    clean|--clean)
        clean_logs
        exit 0
        ;;
    production|preview)
        ENVIRONMENT=$1
        main
        ;;
    *)
        main
        ;;
esac

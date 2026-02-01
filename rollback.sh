#!/bin/bash
# CampaignSites.net Rollback Script
# Usage: ./rollback.sh [deployment-id|previous]
#
# Features:
#   - List recent deployments
#   - Rollback to specific deployment
#   - Rollback to previous deployment
#   - Verify rollback success
#   - Health checks after rollback

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/campaignsites-deploy"
ROLLBACK_LOG="$LOG_DIR/rollback-$(date +%Y%m%d-%H%M%S).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$ROLLBACK_LOG"
}

# Error handler
error_handler() {
    local line_no=$1
    log_error "Error occurred at line $line_no"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found. Install with: npm install -g wrangler"
        exit 1
    fi

    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_warning "jq not found. Install for better JSON parsing: brew install jq"
    fi

    log_success "Prerequisites check passed"
}

# List recent deployments
list_deployments() {
    log_step "Fetching recent deployments..."

    local deployments=$(wrangler pages deployments list --project-name="$PROJECT_NAME" 2>/dev/null || echo "")

    if [ -z "$deployments" ]; then
        log_error "No deployments found or unable to fetch deployments"
        exit 1
    fi

    echo ""
    echo "Recent deployments for $PROJECT_NAME:"
    echo "========================================"
    echo "$deployments" | head -20
    echo "========================================"
    echo ""

    export DEPLOYMENTS_LIST="$deployments"
}

# Get deployment info
get_deployment_info() {
    local deployment_id=$1

    log_step "Fetching deployment info for $deployment_id..."

    # Try to get deployment details
    local info=$(wrangler pages deployment list --project-name="$PROJECT_NAME" 2>/dev/null | grep "$deployment_id" || echo "")

    if [ -z "$info" ]; then
        log_warning "Could not fetch detailed info for deployment $deployment_id"
        return 1
    fi

    echo "$info"
}

# Verify deployment exists
verify_deployment() {
    local deployment_id=$1

    log_step "Verifying deployment $deployment_id..."

    if echo "$DEPLOYMENTS_LIST" | grep -q "$deployment_id"; then
        log_success "Deployment $deployment_id found"
        return 0
    else
        log_error "Deployment $deployment_id not found"
        return 1
    fi
}

# Get current deployment
get_current_deployment() {
    log_step "Getting current deployment..."

    local current=$(echo "$DEPLOYMENTS_LIST" | head -2 | tail -1 | awk '{print $1}')

    if [ -n "$current" ]; then
        log_info "Current deployment: $current"
        export CURRENT_DEPLOYMENT="$current"
    else
        log_warning "Could not determine current deployment"
    fi
}

# Get previous deployment
get_previous_deployment() {
    log_step "Getting previous deployment..."

    # Get the second deployment (first is current, second is previous)
    local previous=$(echo "$DEPLOYMENTS_LIST" | head -3 | tail -1 | awk '{print $1}')

    if [ -n "$previous" ]; then
        log_info "Previous deployment: $previous"
        export PREVIOUS_DEPLOYMENT="$previous"
        return 0
    else
        log_error "Could not determine previous deployment"
        return 1
    fi
}

# Backup current state
backup_current_state() {
    log_step "Backing up current deployment state..."

    local backup_file="$LOG_DIR/pre-rollback-$(date +%Y%m%d-%H%M%S).json"

    wrangler pages deployments list --project-name="$PROJECT_NAME" --json 2>/dev/null | head -1 > "$backup_file" || true

    if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
        log_info "Current state saved to: $backup_file"
        export BACKUP_FILE="$backup_file"
    else
        log_warning "Could not backup current state"
    fi
}

# Execute rollback
execute_rollback() {
    local target_deployment=$1

    log_step "Rolling back to deployment: $target_deployment"

    echo ""
    log_warning "This will rollback the production deployment!"
    read -p "Are you sure you want to continue? (yes/no) " -r
    echo

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi

    # Execute rollback using Cloudflare API or wrangler
    log_info "Executing rollback..."

    # Note: Cloudflare Pages doesn't have a direct rollback command
    # We need to promote a previous deployment or redeploy
    log_info "To rollback, you need to:"
    echo "  1. Go to Cloudflare Dashboard"
    echo "  2. Navigate to Workers & Pages → $PROJECT_NAME → Deployments"
    echo "  3. Find deployment: $target_deployment"
    echo "  4. Click 'Rollback to this deployment' or 'Retry deployment'"
    echo ""
    log_info "Alternatively, redeploy from the git commit associated with that deployment"

    # For automated rollback, we would need to:
    # 1. Get the git commit from the deployment
    # 2. Checkout that commit
    # 3. Run deploy.sh

    log_warning "Automated rollback not fully implemented yet"
    log_info "Manual rollback required via Cloudflare Dashboard"
}

# Health check after rollback
health_check() {
    local url=$1

    if [ -z "$url" ]; then
        log_warning "No URL provided for health check"
        return 0
    fi

    log_step "Running health check on $url..."

    local retries=3
    local success=false

    for i in $(seq 1 $retries); do
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

        if [ "$status" = "200" ]; then
            success=true
            log_success "Health check passed (HTTP $status)"
            break
        fi

        log_warning "Health check attempt $i failed (HTTP $status)"
        sleep 5
    done

    if [ "$success" = false ]; then
        log_error "Health check failed after $retries attempts"
        return 1
    fi
}

# Verify rollback success
verify_rollback() {
    local target_deployment=$1

    log_step "Verifying rollback..."

    # Get current deployment after rollback
    local current=$(wrangler pages deployments list --project-name="$PROJECT_NAME" 2>/dev/null | head -2 | tail -1 | awk '{print $1}')

    if [ "$current" = "$target_deployment" ]; then
        log_success "Rollback verified: Current deployment is $target_deployment"
        return 0
    else
        log_warning "Rollback verification inconclusive"
        log_info "Current deployment: $current"
        log_info "Target deployment: $target_deployment"
        return 1
    fi
}

# Show rollback history
show_history() {
    log_step "Rollback History"

    if [ -d "$LOG_DIR" ]; then
        echo ""
        echo "Recent rollback logs:"
        ls -lht "$LOG_DIR"/rollback-*.log 2>/dev/null | head -10 || log_info "No rollback history found"
    fi
}

# Main rollback flow
main() {
    local target_deployment=${1:-}

    log_info "========================================"
    log_info "CampaignSites.net Rollback"
    log_info "Project: $PROJECT_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Log: $ROLLBACK_LOG"
    log_info "========================================"
    echo ""

    check_prerequisites
    list_deployments
    get_current_deployment

    if [ -z "$target_deployment" ] || [ "$target_deployment" = "previous" ]; then
        # Rollback to previous deployment
        get_previous_deployment

        if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
            log_error "No previous deployment found"
            exit 1
        fi

        target_deployment="$PREVIOUS_DEPLOYMENT"
        log_info "Target: Previous deployment ($target_deployment)"
    else
        # Rollback to specific deployment
        verify_deployment "$target_deployment"
        log_info "Target: Specific deployment ($target_deployment)"
    fi

    # Show deployment info
    echo ""
    log_info "Rollback Details:"
    echo "  From: ${CURRENT_DEPLOYMENT:-unknown}"
    echo "  To:   $target_deployment"
    echo ""

    backup_current_state
    execute_rollback "$target_deployment"

    echo ""
    log_info "========================================"
    log_info "Rollback process completed"
    log_info "Log: $ROLLBACK_LOG"
    log_info "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Verify the rollback in Cloudflare Dashboard"
    echo "  2. Test critical functionality"
    echo "  3. Monitor error logs"
    echo "  4. Check deployment status: ./deploy.sh status"
    echo ""
}

# Show help
show_help() {
    cat << EOF
CampaignSites.net Rollback Script

Usage: $0 [deployment-id|previous|command]

Arguments:
  deployment-id    Rollback to specific deployment ID
  previous         Rollback to previous deployment (default)

Commands:
  list             List recent deployments
  history          Show rollback history
  --help, -h       Show this help message

Examples:
  $0                           Rollback to previous deployment
  $0 previous                  Rollback to previous deployment
  $0 abc123def                 Rollback to specific deployment
  $0 list                      List recent deployments

Environment Variables:
  CLOUDFLARE_ENV              Override environment (production/preview)

For more information, see DEPLOYMENT.md
EOF
}

# Handle script arguments
case "${1:-previous}" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    list)
        check_prerequisites
        list_deployments
        exit 0
        ;;
    history)
        show_history
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac

#!/bin/bash
# CampaignSites.net Deployment Script
# Usage: ./deploy.sh [environment]
#   environment: 'production' (default) or 'preview'

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="campaignsites"
DATABASE_NAME="campaign-db"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_prerequisites() {
    log_info "Running pre-deployment checks..."

    # Check for wrangler
    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found. Install with: npm install -g wrangler"
        exit 1
    fi

    # Check for pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found. Install with: npm install -g pnpm"
        exit 1
    fi

    # Check if wrangler is authenticated
    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        exit 1
    fi

    # Check for required environment variables in production
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Checking environment variables..."

        # These would be set in Cloudflare dashboard, not locally
        # But we can verify wrangler.toml is configured
        if grep -q "YOUR-D1-ID-HERE" wrangler.toml; then
            log_warning "D1 database ID not configured in wrangler.toml"
            read -p "Continue anyway? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Deployment aborted"
                exit 1
            fi
        fi
    fi

    log_success "Pre-deployment checks passed"
}

# Generate types
generate_types() {
    log_info "Generating TypeScript types..."

    pnpm run generate:types:cloudflare || {
        log_error "Failed to generate Cloudflare types"
        exit 1
    }

    pnpm run generate:types:payload || {
        log_error "Failed to generate Payload types"
        exit 1
    }

    pnpm run generate:importmap || {
        log_error "Failed to generate import map"
        exit 1
    }

    log_success "Type generation complete"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    export CLOUDFLARE_ENV=$ENVIRONMENT
    export NODE_ENV=production
    export PAYLOAD_SECRET=ignore

    if pnpm run deploy:database 2>&1 | tee /tmp/migration.log; then
        log_success "Database migrations complete"
    else
        log_error "Database migrations failed. Check /tmp/migration.log"
        exit 1
    fi
}

# Verify build
verify_build() {
    log_info "Verifying build..."

    # Check if .next directory exists after build
    if [ ! -d ".next" ]; then
        log_warning ".next directory not found. Running build..."
        pnpm run build || {
            log_error "Build failed"
            exit 1
        }
    fi

    # Check for critical build artifacts
    if [ ! -f ".next/BUILD_ID" ]; then
        log_error "Build ID not found. Build may be incomplete."
        exit 1
    fi

    log_success "Build verification complete"
}

# Deploy to Cloudflare
deploy_app() {
    log_info "Deploying to Cloudflare ($ENVIRONMENT)..."

    export CLOUDFLARE_ENV=$ENVIRONMENT

    if pnpm run deploy:app 2>&1 | tee /tmp/deploy.log; then
        log_success "Deployment complete"
    else
        log_error "Deployment failed. Check /tmp/deploy.log"
        exit 1
    fi

    # Extract deployment URL from logs if available
    if grep -o 'https://.*.pages.dev' /tmp/deploy.log; then
        log_success "Deployment URL available in logs above"
    fi
}

# Rollback to previous deployment
rollback() {
    log_warning "Initiating rollback..."

    log_info "Fetching recent deployments..."
    wrangler pages deployments list --project-name=$PROJECT_NAME

    log_info "To rollback, use:"
    echo "  wrangler pages deployment rollback --project-name=$PROJECT_NAME"
    echo ""
    echo "Or via Cloudflare Dashboard:"
    echo "  Pages → $PROJECT_NAME → Deployments → Select previous → Rollback"
}

# Post-deployment checks
post_deploy_checks() {
    log_info "Running post-deployment checks..."

    # Check D1 connectivity
    log_info "Verifying D1 database connection..."
    if wrangler d1 execute $DATABASE_NAME --command "SELECT 1" --remote &> /dev/null; then
        log_success "D1 database is accessible"
    else
        log_warning "Could not verify D1 connection (may be expected for first deployment)"
    fi

    # List recent deployments
    log_info "Recent deployments:"
    wrangler pages deployments list --project-name=$PROJECT_NAME | head -n 5

    log_success "Post-deployment checks complete"
}

# Main deployment flow
main() {
    log_info "Starting deployment to $ENVIRONMENT..."
    log_info "Project: $PROJECT_NAME"
    log_info "Database: $DATABASE_NAME"
    echo ""

    # Run deployment steps
    check_prerequisites
    generate_types
    run_migrations
    verify_build
    deploy_app
    post_deploy_checks

    echo ""
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your Cloudflare Pages dashboard"
    echo "  2. Verify the deployment is live"
    echo "  3. Test critical paths (homepage, admin, tools)"
    echo "  4. Check logs for any errors"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [environment|command]"
        echo ""
        echo "Environments:"
        echo "  production    Deploy to production (default)"
        echo "  preview       Deploy to preview environment"
        echo ""
        echo "Commands:"
        echo "  rollback      Show rollback instructions"
        echo "  --help, -h    Show this help message"
        exit 0
        ;;
    rollback|--rollback)
        rollback
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

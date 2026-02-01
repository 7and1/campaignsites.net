#!/bin/bash
# CampaignSites.net Environment Setup Script
# Usage: ./setup-env.sh [environment]
#
# Features:
#   - Create KV namespaces
#   - Create Queues
#   - Create R2 buckets
#   - Set secrets
#   - Verify setup
#   - Update wrangler.toml

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
ENVIRONMENT="${1:-production}"
PROJECT_NAME="campaignsites"
DATABASE_NAME="campaign-db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/campaignsites-deploy"
SETUP_LOG="$LOG_DIR/setup-$(date +%Y%m%d-%H%M%S).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$SETUP_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$SETUP_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$SETUP_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$SETUP_LOG"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$SETUP_LOG"
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

    local errors=0

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found. Install with: npm install -g wrangler"
        errors=$((errors + 1))
    else
        log_info "Wrangler version: $(wrangler --version)"
    fi

    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        errors=$((errors + 1))
    else
        local account=$(wrangler whoami 2>/dev/null | grep -o '[^[:space:]]*@[^[:space:]]*' || echo "unknown")
        log_info "Authenticated as: $account"
    fi

    if [ ! -f "wrangler.toml" ]; then
        log_error "wrangler.toml not found"
        errors=$((errors + 1))
    fi

    if [ $errors -gt 0 ]; then
        log_error "$errors prerequisite check(s) failed"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Create D1 database
create_d1_database() {
    log_step "Setting up D1 database..."

    # Check if database exists
    if wrangler d1 list 2>/dev/null | grep -q "$DATABASE_NAME"; then
        log_info "D1 database '$DATABASE_NAME' already exists"

        # Get database ID
        local db_id=$(wrangler d1 list 2>/dev/null | grep "$DATABASE_NAME" | awk '{print $2}')
        if [ -n "$db_id" ]; then
            log_info "Database ID: $db_id"
            export D1_DATABASE_ID="$db_id"
        fi
    else
        log_info "Creating D1 database '$DATABASE_NAME'..."

        local output=$(wrangler d1 create "$DATABASE_NAME" 2>&1)
        echo "$output" | tee -a "$SETUP_LOG"

        # Extract database ID from output
        local db_id=$(echo "$output" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

        if [ -n "$db_id" ]; then
            log_success "D1 database created with ID: $db_id"
            export D1_DATABASE_ID="$db_id"
        else
            log_error "Failed to create D1 database"
            return 1
        fi
    fi
}

# Create KV namespaces
create_kv_namespaces() {
    log_step "Setting up KV namespaces..."

    local namespaces=("RATE_LIMIT_KV" "CACHE_KV")

    for ns in "${namespaces[@]}"; do
        local ns_name="${PROJECT_NAME}-${ns,,}"

        # Check if namespace exists
        if wrangler kv:namespace list 2>/dev/null | grep -q "$ns_name"; then
            log_info "KV namespace '$ns_name' already exists"

            # Get namespace ID
            local ns_id=$(wrangler kv:namespace list 2>/dev/null | grep "$ns_name" | grep -o 'id = "[^"]*"' | cut -d'"' -f2 | head -1)
            if [ -n "$ns_id" ]; then
                log_info "Namespace ID: $ns_id"
                export "${ns}_ID=$ns_id"
            fi
        else
            log_info "Creating KV namespace '$ns_name'..."

            local output=$(wrangler kv:namespace create "$ns_name" 2>&1)
            echo "$output" | tee -a "$SETUP_LOG"

            # Extract namespace ID
            local ns_id=$(echo "$output" | grep -o 'id = "[^"]*"' | cut -d'"' -f2 | head -1)

            if [ -n "$ns_id" ]; then
                log_success "KV namespace created with ID: $ns_id"
                export "${ns}_ID=$ns_id"
            else
                log_warning "Could not extract namespace ID for $ns_name"
            fi
        fi
    done
}

# Create R2 buckets
create_r2_buckets() {
    log_step "Setting up R2 buckets..."

    local buckets=("campaign-media" "campaignsites-cache")

    for bucket in "${buckets[@]}"; do
        # Check if bucket exists
        if wrangler r2 bucket list 2>/dev/null | grep -q "$bucket"; then
            log_info "R2 bucket '$bucket' already exists"
        else
            log_info "Creating R2 bucket '$bucket'..."

            if wrangler r2 bucket create "$bucket" 2>&1 | tee -a "$SETUP_LOG"; then
                log_success "R2 bucket '$bucket' created"
            else
                log_error "Failed to create R2 bucket '$bucket'"
                return 1
            fi
        fi
    done
}

# Create Queues
create_queues() {
    log_step "Setting up Queues..."

    local queues=("email-queue" "email-dlq")

    for queue in "${queues[@]}"; do
        # Check if queue exists
        if wrangler queues list 2>/dev/null | grep -q "$queue"; then
            log_info "Queue '$queue' already exists"
        else
            log_info "Creating queue '$queue'..."

            if wrangler queues create "$queue" 2>&1 | tee -a "$SETUP_LOG"; then
                log_success "Queue '$queue' created"
            else
                log_warning "Could not create queue '$queue' (may require paid plan)"
            fi
        fi
    done
}

# Set secrets
set_secrets() {
    log_step "Setting up secrets..."

    log_info "Secrets must be set manually for security"
    echo ""
    echo "Required secrets:"
    echo "  1. PAYLOAD_SECRET - Generate with: openssl rand -hex 32"
    echo "  2. IP_HASH_SALT - Generate with: openssl rand -hex 16"
    echo ""
    echo "Optional secrets:"
    echo "  3. OPENAI_API_KEY - For AI features"
    echo "  4. RESEND_API_KEY - For email services"
    echo ""
    echo "Set secrets with:"
    echo "  wrangler secret put PAYLOAD_SECRET --env=$ENVIRONMENT"
    echo "  wrangler secret put IP_HASH_SALT --env=$ENVIRONMENT"
    echo ""

    read -p "Do you want to set secrets now? (y/N) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # PAYLOAD_SECRET
        echo ""
        log_info "Setting PAYLOAD_SECRET..."
        echo "Generate with: openssl rand -hex 32"
        read -p "Enter PAYLOAD_SECRET (or press Enter to skip): " -s payload_secret
        echo

        if [ -n "$payload_secret" ]; then
            echo "$payload_secret" | wrangler secret put PAYLOAD_SECRET --env="$ENVIRONMENT"
            log_success "PAYLOAD_SECRET set"
        else
            log_warning "PAYLOAD_SECRET skipped"
        fi

        # IP_HASH_SALT
        echo ""
        log_info "Setting IP_HASH_SALT..."
        echo "Generate with: openssl rand -hex 16"
        read -p "Enter IP_HASH_SALT (or press Enter to skip): " -s ip_hash_salt
        echo

        if [ -n "$ip_hash_salt" ]; then
            echo "$ip_hash_salt" | wrangler secret put IP_HASH_SALT --env="$ENVIRONMENT"
            log_success "IP_HASH_SALT set"
        else
            log_warning "IP_HASH_SALT skipped"
        fi

        # Optional secrets
        echo ""
        read -p "Set optional secrets? (y/N) " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # OPENAI_API_KEY
            echo ""
            read -p "Enter OPENAI_API_KEY (or press Enter to skip): " -s openai_key
            echo

            if [ -n "$openai_key" ]; then
                echo "$openai_key" | wrangler secret put OPENAI_API_KEY --env="$ENVIRONMENT"
                log_success "OPENAI_API_KEY set"
            fi

            # RESEND_API_KEY
            echo ""
            read -p "Enter RESEND_API_KEY (or press Enter to skip): " -s resend_key
            echo

            if [ -n "$resend_key" ]; then
                echo "$resend_key" | wrangler secret put RESEND_API_KEY --env="$ENVIRONMENT"
                log_success "RESEND_API_KEY set"
            fi
        fi
    else
        log_info "Secrets setup skipped"
    fi
}

# Update wrangler.toml
update_wrangler_config() {
    log_step "Updating wrangler.toml..."

    if [ ! -f "wrangler.toml" ]; then
        log_error "wrangler.toml not found"
        return 1
    fi

    # Backup current config
    cp wrangler.toml "wrangler.toml.backup-$(date +%Y%m%d-%H%M%S)"
    log_info "Backed up wrangler.toml"

    # Update D1 database ID
    if [ -n "$D1_DATABASE_ID" ]; then
        log_info "Updating D1 database ID in wrangler.toml..."

        # Update production environment
        if grep -q "env.production" wrangler.toml; then
            sed -i.tmp "s/database_id = \"[^\"]*\"/database_id = \"$D1_DATABASE_ID\"/g" wrangler.toml
            rm -f wrangler.toml.tmp
            log_success "Updated D1 database ID"
        fi
    fi

    # Update KV namespace IDs
    if [ -n "$RATE_LIMIT_KV_ID" ]; then
        log_info "Updating RATE_LIMIT_KV ID..."
        sed -i.tmp "s/binding = \"RATE_LIMIT_KV\".*id = \"[^\"]*\"/binding = \"RATE_LIMIT_KV\"\nid = \"$RATE_LIMIT_KV_ID\"/g" wrangler.toml
        rm -f wrangler.toml.tmp
    fi

    if [ -n "$CACHE_KV_ID" ]; then
        log_info "Updating CACHE_KV ID..."
        sed -i.tmp "s/binding = \"CACHE_KV\".*id = \"[^\"]*\"/binding = \"CACHE_KV\"\nid = \"$CACHE_KV_ID\"/g" wrangler.toml
        rm -f wrangler.toml.tmp
    fi

    log_success "wrangler.toml updated"
}

# Verify setup
verify_setup() {
    log_step "Verifying setup..."

    local errors=0

    # Verify D1
    if wrangler d1 list 2>/dev/null | grep -q "$DATABASE_NAME"; then
        log_success "✓ D1 database verified"
    else
        log_error "✗ D1 database not found"
        errors=$((errors + 1))
    fi

    # Verify R2 buckets
    local r2_buckets=("campaign-media" "campaignsites-cache")
    for bucket in "${r2_buckets[@]}"; do
        if wrangler r2 bucket list 2>/dev/null | grep -q "$bucket"; then
            log_success "✓ R2 bucket '$bucket' verified"
        else
            log_error "✗ R2 bucket '$bucket' not found"
            errors=$((errors + 1))
        fi
    done

    # Verify KV namespaces
    if wrangler kv:namespace list 2>/dev/null | grep -q "campaignsites"; then
        log_success "✓ KV namespaces verified"
    else
        log_warning "✗ KV namespaces may not be configured"
    fi

    # Verify queues
    if wrangler queues list 2>/dev/null | grep -q "email-queue"; then
        log_success "✓ Queues verified"
    else
        log_warning "✗ Queues may not be configured"
    fi

    if [ $errors -gt 0 ]; then
        log_error "$errors verification check(s) failed"
        return 1
    else
        log_success "All resources verified"
    fi
}

# Show setup status
show_status() {
    log_step "Environment Setup Status"

    echo ""
    echo "Cloudflare Resources:"
    echo "========================================"

    # D1 Databases
    echo ""
    echo "D1 Databases:"
    wrangler d1 list 2>/dev/null | grep -E "$DATABASE_NAME|Name" || log_warning "No D1 databases found"

    # R2 Buckets
    echo ""
    echo "R2 Buckets:"
    wrangler r2 bucket list 2>/dev/null | grep -E "campaign|Name" || log_warning "No R2 buckets found"

    # KV Namespaces
    echo ""
    echo "KV Namespaces:"
    wrangler kv:namespace list 2>/dev/null | grep -E "campaignsites|title" || log_warning "No KV namespaces found"

    # Queues
    echo ""
    echo "Queues:"
    wrangler queues list 2>/dev/null | grep -E "email|Name" || log_warning "No queues found"

    # Secrets
    echo ""
    echo "Secrets:"
    wrangler secret list --env="$ENVIRONMENT" 2>/dev/null || log_warning "Could not list secrets"

    echo "========================================"
    echo ""
}

# Main setup flow
main() {
    log_info "========================================"
    log_info "CampaignSites.net Environment Setup"
    log_info "Environment: $ENVIRONMENT"
    log_info "Project: $PROJECT_NAME"
    log_info "Log: $SETUP_LOG"
    log_info "========================================"
    echo ""

    check_prerequisites
    create_d1_database
    create_kv_namespaces
    create_r2_buckets
    create_queues
    update_wrangler_config
    set_secrets
    verify_setup

    echo ""
    log_success "========================================"
    log_success "Environment setup completed!"
    log_success "Log: $SETUP_LOG"
    log_success "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Review wrangler.toml for correct IDs"
    echo "  2. Run migrations: ./migrate.sh"
    echo "  3. Deploy application: ./deploy.sh $ENVIRONMENT"
    echo "  4. Verify deployment: ./deploy.sh status"
    echo ""
}

# Show help
show_help() {
    cat << EOF
CampaignSites.net Environment Setup Script

Usage: $0 [environment|command]

Environments:
  production    Setup production environment (default)
  preview       Setup preview/staging environment

Commands:
  setup         Run full setup (default)
  status        Show current setup status
  verify        Verify existing setup
  --help, -h    Show this help message

Examples:
  $0                    Setup production environment
  $0 preview            Setup preview environment
  $0 status             Show setup status
  $0 verify             Verify existing setup

Environment Variables:
  CLOUDFLARE_ENV       Override environment

For more information, see DEPLOYMENT.md
EOF
}

# Handle script arguments
case "${1:-setup}" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    setup|production|preview)
        if [ "$1" = "preview" ]; then
            ENVIRONMENT="preview"
        fi
        main
        ;;
    status)
        check_prerequisites
        show_status
        ;;
    verify)
        check_prerequisites
        verify_setup
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

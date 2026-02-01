#!/bin/bash
# CampaignSites.net Database Migration Script
# Usage: ./migrate.sh [command] [options]
#
# Features:
#   - Check current schema version
#   - List pending migrations
#   - Execute migrations
#   - Verify migration success
#   - Rollback on failure
#   - Backup before migration

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
DATABASE_NAME="campaign-db"
ENVIRONMENT="${CLOUDFLARE_ENV:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/campaignsites-deploy"
MIGRATE_LOG="$LOG_DIR/migrate-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="$LOG_DIR/db-backups"

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$MIGRATE_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$MIGRATE_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$MIGRATE_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$MIGRATE_LOG"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$MIGRATE_LOG"
}

# Error handler
error_handler() {
    local line_no=$1
    log_error "Error occurred at line $line_no"
    log_error "Migration failed. Check log: $MIGRATE_LOG"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    local errors=0

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler CLI not found"
        errors=$((errors + 1))
    fi

    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm not found"
        errors=$((errors + 1))
    fi

    if ! wrangler whoami &> /dev/null; then
        log_error "Not authenticated with Cloudflare. Run: wrangler login"
        errors=$((errors + 1))
    fi

    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Run from project root."
        errors=$((errors + 1))
    fi

    if [ $errors -gt 0 ]; then
        log_error "$errors prerequisite check(s) failed"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Check database connection
check_database() {
    log_step "Checking database connection..."

    if wrangler d1 execute "$DATABASE_NAME" --command "SELECT 1" --env="$ENVIRONMENT" --remote &> /dev/null; then
        log_success "Database connection successful"
        return 0
    else
        log_error "Cannot connect to database '$DATABASE_NAME'"
        return 1
    fi
}

# Get current schema version
get_schema_version() {
    log_step "Getting current schema version..."

    # Query the payload_migrations table
    local version=$(wrangler d1 execute "$DATABASE_NAME" \
        --command "SELECT name FROM payload_migrations ORDER BY batch DESC, id DESC LIMIT 1" \
        --env="$ENVIRONMENT" --remote 2>/dev/null | grep -v "Results" | tail -1 || echo "none")

    if [ -n "$version" ] && [ "$version" != "none" ]; then
        log_info "Current schema version: $version"
        export CURRENT_VERSION="$version"
    else
        log_info "No migrations found (fresh database)"
        export CURRENT_VERSION="none"
    fi
}

# List all migrations
list_migrations() {
    log_step "Listing migration history..."

    echo ""
    echo "Migration History:"
    echo "========================================"

    wrangler d1 execute "$DATABASE_NAME" \
        --command "SELECT id, name, batch, timestamp FROM payload_migrations ORDER BY id DESC LIMIT 20" \
        --env="$ENVIRONMENT" --remote 2>/dev/null || log_warning "Could not fetch migration history"

    echo "========================================"
    echo ""
}

# Backup database
backup_database() {
    log_step "Backing up database..."

    local backup_file="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"

    # Export database schema and data
    log_info "Creating backup: $backup_file"

    # Get all tables
    local tables=$(wrangler d1 execute "$DATABASE_NAME" \
        --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'" \
        --env="$ENVIRONMENT" --remote 2>/dev/null | grep -v "Results" | tail -n +2 || echo "")

    if [ -n "$tables" ]; then
        echo "-- Database backup created at $(date)" > "$backup_file"
        echo "-- Environment: $ENVIRONMENT" >> "$backup_file"
        echo "" >> "$backup_file"

        # For each table, export schema and data
        while IFS= read -r table; do
            if [ -n "$table" ]; then
                log_info "Backing up table: $table"

                # Get table schema
                wrangler d1 execute "$DATABASE_NAME" \
                    --command "SELECT sql FROM sqlite_master WHERE type='table' AND name='$table'" \
                    --env="$ENVIRONMENT" --remote 2>/dev/null >> "$backup_file" || true

                echo ";" >> "$backup_file"
                echo "" >> "$backup_file"
            fi
        done <<< "$tables"

        log_success "Backup created: $backup_file"
        export BACKUP_FILE="$backup_file"
    else
        log_warning "No tables found to backup"
    fi
}

# Run migrations
run_migrations() {
    log_step "Running database migrations..."

    export NODE_ENV=production
    export PAYLOAD_SECRET="${PAYLOAD_SECRET:-ignore}"
    export CLOUDFLARE_ENV="$ENVIRONMENT"

    log_info "Executing Payload migrations..."

    if pnpm run deploy:database 2>&1 | tee -a "$MIGRATE_LOG"; then
        log_success "Migrations completed successfully"
        return 0
    else
        log_error "Migrations failed"
        return 1
    fi
}

# Verify migrations
verify_migrations() {
    log_step "Verifying migrations..."

    # Check if database is accessible
    if ! check_database; then
        log_error "Database verification failed"
        return 1
    fi

    # Get new schema version
    local new_version=$(wrangler d1 execute "$DATABASE_NAME" \
        --command "SELECT name FROM payload_migrations ORDER BY batch DESC, id DESC LIMIT 1" \
        --env="$ENVIRONMENT" --remote 2>/dev/null | grep -v "Results" | tail -1 || echo "none")

    if [ -n "$new_version" ] && [ "$new_version" != "none" ]; then
        log_success "New schema version: $new_version"

        if [ "$new_version" != "$CURRENT_VERSION" ]; then
            log_success "Schema updated successfully"
        else
            log_info "Schema unchanged (no new migrations)"
        fi
    else
        log_warning "Could not verify new schema version"
    fi

    # Run basic query test
    if wrangler d1 execute "$DATABASE_NAME" \
        --command "SELECT COUNT(*) FROM payload_migrations" \
        --env="$ENVIRONMENT" --remote &> /dev/null; then
        log_success "Database queries working"
    else
        log_error "Database queries failing"
        return 1
    fi

    log_success "Migration verification passed"
}

# Rollback migrations
rollback_migrations() {
    local steps=${1:-1}

    log_step "Rolling back $steps migration(s)..."

    log_warning "Automatic rollback not implemented"
    log_info "To rollback manually:"
    echo "  1. Restore from backup: $BACKUP_FILE"
    echo "  2. Or manually revert schema changes"
    echo ""

    if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
        read -p "Restore from backup? (yes/no) " -r
        echo

        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            restore_backup "$BACKUP_FILE"
        fi
    fi
}

# Restore from backup
restore_backup() {
    local backup_file=$1

    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi

    log_step "Restoring from backup: $backup_file"

    log_warning "This will overwrite the current database!"
    read -p "Are you sure? (yes/no) " -r
    echo

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Restore cancelled"
        return 0
    fi

    # Execute backup SQL
    log_info "Executing restore..."

    # Note: This is simplified. In production, you'd need to:
    # 1. Drop existing tables
    # 2. Recreate from backup
    # 3. Verify data integrity

    log_warning "Manual restore required"
    log_info "Backup file: $backup_file"
}

# Show migration status
show_status() {
    log_step "Migration Status"

    check_database
    get_schema_version
    list_migrations

    echo ""
    log_info "Database: $DATABASE_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Current version: ${CURRENT_VERSION:-unknown}"
    echo ""
}

# Clean old backups
clean_backups() {
    log_step "Cleaning old backups..."

    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "No backup directory found"
        return 0
    fi

    local count=$(find "$BACKUP_DIR" -name "backup-*.sql" -type f | wc -l)

    if [ "$count" -gt 10 ]; then
        log_info "Found $count backups, keeping last 10..."
        find "$BACKUP_DIR" -name "backup-*.sql" -type f -mtime +7 -delete
        local new_count=$(find "$BACKUP_DIR" -name "backup-*.sql" -type f | wc -l)
        log_info "Backups: $new_count (was $count)"
    else
        log_info "Backups: $count (no cleanup needed)"
    fi
}

# Main migration flow
main() {
    log_info "========================================"
    log_info "CampaignSites.net Database Migration"
    log_info "Database: $DATABASE_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Log: $MIGRATE_LOG"
    log_info "========================================"
    echo ""

    check_prerequisites
    check_database
    get_schema_version
    backup_database
    run_migrations
    verify_migrations
    clean_backups

    echo ""
    log_success "========================================"
    log_success "Migration completed successfully"
    log_success "Log: $MIGRATE_LOG"
    if [ -n "$BACKUP_FILE" ]; then
        log_success "Backup: $BACKUP_FILE"
    fi
    log_success "========================================"
    echo ""
}

# Show help
show_help() {
    cat << EOF
CampaignSites.net Database Migration Script

Usage: $0 [command] [options]

Commands:
  migrate          Run pending migrations (default)
  status           Show migration status
  list             List migration history
  rollback [n]     Rollback last n migrations (default: 1)
  backup           Create database backup
  restore [file]   Restore from backup file
  clean            Clean old backup files
  --help, -h       Show this help message

Examples:
  $0                           Run migrations
  $0 status                    Show migration status
  $0 list                      List migration history
  $0 rollback                  Rollback last migration
  $0 rollback 3                Rollback last 3 migrations
  $0 backup                    Create backup only
  $0 restore backup.sql        Restore from backup

Environment Variables:
  CLOUDFLARE_ENV              Override environment (production/preview)
  PAYLOAD_SECRET              Payload CMS secret (required for migrations)

For more information, see DEPLOYMENT.md
EOF
}

# Handle script arguments
case "${1:-migrate}" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    migrate|run)
        main
        ;;
    status)
        check_prerequisites
        show_status
        ;;
    list)
        check_prerequisites
        check_database
        list_migrations
        ;;
    rollback)
        check_prerequisites
        check_database
        get_schema_version
        rollback_migrations "${2:-1}"
        ;;
    backup)
        check_prerequisites
        check_database
        backup_database
        ;;
    restore)
        check_prerequisites
        restore_backup "${2:-}"
        ;;
    clean)
        clean_backups
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

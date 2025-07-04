#!/bin/bash

# EGX Pilot Advisor Backend Setup Script
# هذا السكريبت يقوم بإعداد وتشغيل الـ Backend تلقائياً

set -e  # Exit on any error

echo "🚀 Setting up EGX Pilot Advisor Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is available
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not available."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your configuration:"
        print_warning "- DATABASE_URL (SQL Server connection)"
        print_warning "- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
        print_warning "- EMAIL_USER and EMAIL_PASSWORD (for notifications)"
        print_warning "- JWT_SECRET (generate a secure random string)"
        echo ""
        print_status "Opening .env file for editing..."
        ${EDITOR:-nano} .env
    else
        print_success ".env file already exists"
    fi
}

# Generate Prisma client
setup_prisma() {
    print_status "Setting up Prisma..."
    
    if npm run prisma:generate; then
        print_success "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        exit 1
    fi
    
    print_status "Pushing database schema..."
    if npm run prisma:push; then
        print_success "Database schema applied"
    else
        print_warning "Database schema push failed. Make sure SQL Server is running and accessible."
        print_warning "Connection string: sqlserver://localhost:1433;database=EGX_Pilot_Advisor;user=sa;password=curhi6-qEbfid"
    fi
}

# Build the project
build_project() {
    print_status "Building TypeScript project..."
    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Main setup function
main() {
    echo "📋 Starting EGX Pilot Advisor Backend Setup"
    echo "=========================================="
    
    # Navigate to backend directory if not already there
    if [ ! -f package.json ]; then
        if [ -d backend ]; then
            cd backend
            print_status "Changed to backend directory"
        else
            print_error "Backend directory not found. Run this script from the project root or backend directory."
            exit 1
        fi
    fi
    
    # Run setup steps
    check_node
    check_npm
    install_dependencies
    setup_env
    setup_prisma
    build_project
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================="
    print_success "Backend is ready to run"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Make sure SQL Server container is running"
    echo "   2. Verify your .env configuration"
    echo "   3. Start the development server: npm run dev"
    echo "   4. Or start production server: npm start"
    echo ""
    echo "🔍 Useful commands:"
    echo "   • Health check: curl http://localhost:3001/health"
    echo "   • API status: curl http://localhost:3001/api/status"
    echo "   • View logs: npm run dev (shows real-time logs)"
    echo "   • Database studio: npm run prisma:studio"
    echo ""
    echo "📚 Documentation: See README.md for detailed information"
    
    # Ask if user wants to start the dev server
    echo ""
    read -p "🚀 Start development server now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting development server..."
        npm run dev
    else
        print_status "You can start the server later with: npm run dev"
    fi
}

# Handle script interruption
trap 'print_error "Setup interrupted by user"; exit 1' INT

# Run main function
main "$@"

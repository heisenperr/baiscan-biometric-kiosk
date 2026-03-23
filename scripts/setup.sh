#!/bin/bash

# BaiScan Biometric Kiosk - Setup Script
# This script initializes environment variables and sets file permissions.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   BaiScan Kiosk - Infrastructure Setup  ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to copy .env.example to .env if it doesn't exist
setup_env() {
    local dir=$1
    local file_path="${dir}/.env"
    local example_path="${dir}/.env.example"

    if [ -f "$example_path" ]; then
        if [ ! -f "$file_path" ]; then
            cp "$example_path" "$file_path"
            echo -e "${GREEN}[OK]${NC} Created .env in ${dir}"
        else
            echo -e "${YELLOW}[SKIP]${NC} .env already exists in ${dir}"
        fi
    else
        echo -e "${YELLOW}[INFO]${NC} No .env.example found in ${dir}"
    fi
}

echo -e "\n${BLUE}Configuring environment variables...${NC}"
setup_env "."
setup_env "backend-service"
setup_env "frontend-service"

echo -e "\n${BLUE}Setting file permissions...${NC}"
if [ -f "kiosk/start-kiosk.sh" ]; then
    chmod +x kiosk/start-kiosk.sh
    echo -e "${GREEN}[OK]${NC} start-kiosk.sh is now executable"
else
    echo -e "${YELLOW}[WARN]${NC} kiosk/start-kiosk.sh not found"
fi

# Ensure the setup script itself is executable (for future runs)
chmod +x scripts/setup.sh

echo -e "\n${GREEN}Setup complete! You can now run:${NC}"
echo -e "${BLUE}docker compose up --build${NC} (Production)"
echo -e "${BLUE}docker compose -f docker-compose.dev.yml up${NC} (Development)"
echo -e "${BLUE}========================================${NC}"

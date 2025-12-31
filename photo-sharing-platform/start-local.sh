#!/bin/bash

echo "========================================="
echo "Photo Sharing Platform - Local Startup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:"$1" >/dev/null 2>&1
}

echo "1. Checking prerequisites..."
echo "----------------------------"

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js is not installed"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✓${NC} npm installed: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm is not installed"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    echo -e "${GREEN}✓${NC} PostgreSQL installed"
else
    echo -e "${RED}✗${NC} PostgreSQL is not installed"
    exit 1
fi

echo ""
echo "2. Starting PostgreSQL..."
echo "------------------------"

# Start PostgreSQL if not running
if ! pg_isready >/dev/null 2>&1; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo service postgresql start
    sleep 2
fi

if pg_isready >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL is running"
else
    echo -e "${RED}✗${NC} PostgreSQL failed to start"
    exit 1
fi

echo ""
echo "3. Setting up database..."
echo "------------------------"

# Create database if it doesn't exist
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw photo_sharing_db
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database already exists"
else
    echo -e "${YELLOW}Creating database...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE photo_sharing_db;" 2>/dev/null
    echo -e "${YELLOW}Initializing schema...${NC}"
    cat database/init.sql | sudo -u postgres psql -d photo_sharing_db
    echo -e "${GREEN}✓${NC} Database created and initialized"
fi

# Set postgres password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" >/dev/null 2>&1

echo ""
echo "4. Installing backend dependencies..."
echo "-------------------------------------"

cd backend
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies already installed"
else
    echo -e "${YELLOW}Installing...${NC}"
    npm install --silent
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
fi

# Update user passwords with correct hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));" > /tmp/hash.txt
HASH=$(cat /tmp/hash.txt)
sudo -u postgres psql -d photo_sharing_db -c "UPDATE users SET password_hash = '$HASH' WHERE email IN ('creator1@example.com', 'creator2@example.com', 'consumer1@example.com', 'consumer2@example.com');" >/dev/null 2>&1

echo ""
echo "5. Starting backend server..."
echo "----------------------------"

# Check if port 5000 is in use
if port_in_use 5000; then
    echo -e "${YELLOW}Port 5000 is already in use. Stopping existing process...${NC}"
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start backend
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend server started (PID: $BACKEND_PID)"
    echo -e "   URL: ${GREEN}http://localhost:5000${NC}"
else
    echo -e "${RED}✗${NC} Backend server failed to start"
    echo "Check backend.log for errors"
    exit 1
fi

cd ..

echo ""
echo "6. Installing frontend dependencies..."
echo "--------------------------------------"

cd frontend
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies already installed"
else
    echo -e "${YELLOW}Installing...${NC}"
    npm install --silent
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Backend is running!${NC}"
echo "========================================="
echo ""
echo "Backend API: http://localhost:5000"
echo "API Health: http://localhost:5000/api/health"
echo ""
echo "To start the frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Demo Accounts:"
echo "  Creator:  creator1@example.com / password123"
echo "  Consumer: consumer1@example.com / password123"
echo ""
echo "To stop the backend:"
echo "  kill $BACKEND_PID"
echo ""
echo "Check backend logs:"
echo "  tail -f backend.log"
echo ""
echo "========================================="

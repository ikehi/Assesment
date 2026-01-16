#!/bin/bash

# GIS Hospital Dashboard Setup Script

echo "🏥 Setting up GIS Hospital Dashboard..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start database services
echo "📦 Starting PostgreSQL and Redis containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are healthy
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Services failed to start. Check docker-compose logs."
    exit 1
fi

# Backend setup
echo "🔧 Setting up backend..."
cd backend
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
EOF
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
cd ..

# Frontend setup
echo "🔧 Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "The backend will initialize the database on first run."
echo "Frontend will be available at http://localhost:3000"

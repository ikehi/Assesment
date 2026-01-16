# Quick Start Guide

## Current Status
✅ All code is complete and ready
✅ Dependencies installed
⚠️ Backend needs PostGIS-enabled PostgreSQL

## Option 1: Use Docker (Recommended)

If you have Docker, use the provided containers:

```bash
# Stop any existing PostgreSQL/Redis on ports 5432/6379 if needed
# Then start containers:
docker-compose up -d

# Wait for services to start (10-15 seconds)
# Then start backend:
cd backend
npm run dev

# In another terminal, start frontend:
cd frontend
npm run dev
```

## Option 2: Enable PostGIS in Existing PostgreSQL

If you want to use your existing PostgreSQL:

1. Connect to PostgreSQL:
```sql
-- Connect to your PostgreSQL (as superuser)
psql -U postgres

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
```

2. Then start the backend:
```bash
cd backend
npm run dev
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

## Verify Everything Works

1. Backend should show: "Server running on http://localhost:3001"
2. Frontend should be at: http://localhost:3000
3. Open browser to http://localhost:3000
4. You should see the map with hospitals and ambulances

## Troubleshooting

**Backend won't start:**
- Check if PostgreSQL is running: `netstat -ano | findstr :5432`
- Check if PostGIS is enabled: Connect to `hospital_db` and run `SELECT PostGIS_version();`
- Check backend logs for specific error messages

**Frontend can't connect:**
- Ensure backend is running on port 3001
- Check browser console for errors

**Database connection errors:**
- Verify DATABASE_URL in `backend/.env` matches your PostgreSQL setup
- Default: `postgresql://postgres:postgres@localhost:5432/hospital_db`

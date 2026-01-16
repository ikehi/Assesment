# Project Update Log

## 2025-01-27

**Task**: GIS-Integrated Hospital Dashboard - Full-Stack Technical Assessment

**Phase 0: Reconnaissance**
- Project directory is empty - greenfield implementation
- Requirements:
  - PostgreSQL + PostGIS database (10 hospitals, 5 ambulances)
  - React frontend with map visualization (MapLibre/Leaflet)
  - Spatial proximity queries (nearest ambulance to hospital)
  - Caching layer for repeated queries
  - API to update ambulance positions

**Architecture Decision**:
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with PostGIS
- Caching: Redis
- Frontend: React + TypeScript + Vite
- Map: MapLibre GL JS (modern, open-source alternative to Mapbox)

**Starting Implementation**...

**Phase 1-2: Implementation Complete**
- Created full project structure (backend + frontend)
- Backend: Express + TypeScript + PostgreSQL + PostGIS + Redis
- Frontend: React + TypeScript + Vite + MapLibre GL JS
- Implemented all required features:
  - Spatial database with 10 hospitals and 5 ambulances
  - PostGIS spatial queries for proximity calculation
  - Redis caching layer (5-minute TTL)
  - React map with hospital/ambulance markers
  - Click hospital → find nearest ambulance
  - API endpoint to update ambulance positions
- Created comprehensive README.md with:
  - Architecture documentation
  - Setup instructions
  - API documentation
  - Learning Log (PostGIS spatial index optimization)

**Files Created:**
- Backend: 10 files (routes, services, database setup)
- Frontend: 9 files (components, services, types)
- Configuration: docker-compose.yml, .gitignore, README.md

**Ready for testing and deployment.**

**Phase 3: Deployment Attempt**
- Installed all dependencies successfully
- Database `hospital_db` exists
- Backend startup blocked: Requires PostGIS extension in PostgreSQL
- Created QUICKSTART.md with setup instructions
- User needs to either:
  1. Use Docker containers (docker-compose up -d)
  2. Enable PostGIS in existing PostgreSQL manually

**Status**: Code complete, awaiting PostGIS-enabled database to run.

**Phase 4: Deployment & Fixes**
- Fixed type mismatch: Changed DECIMAL to DOUBLE PRECISION in migrations
- Dropped and recreated tables with correct schema
- Backend server started successfully on port 3001
- Frontend starting on port 3000
- API endpoints verified: 10 hospitals and 5 ambulances loaded
- Application is now running!

**Phase 5: Frontend Map Fix**
- Root cause: React 18 StrictMode runs effects twice in dev; map was initialized then removed in cleanup, but the ref stayed non-null, preventing re-init.
- Fix: In `frontend/src/components/Map.tsx`, cleanup now clears the retry timer, removes the map, and sets `map.current = null` so the second StrictMode pass can initialize correctly.
- Hardening: Map container sizing is enforced via `Map.css` import plus inline style fallback to avoid 0px-width flex issues.

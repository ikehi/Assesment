# GIS-Integrated Hospital Dashboard

A full-stack application that visualizes hospital locations and calculates the nearest ambulance using spatial database queries. Built with React, Node.js, PostgreSQL (PostGIS), and Redis.

## Features

- **Spatial Database**: PostgreSQL with PostGIS extension storing 10 hospitals and 5 ambulances
- **Interactive Map**: React-based map using MapLibre GL JS displaying hospital and ambulance locations
- **Proximity Calculation**: Click a hospital to find the nearest available ambulance using PostGIS spatial queries
- **Caching Layer**: Redis-based caching to avoid repeated database queries for the same hospital
- **Ambulance Position Updates**: API endpoint to update ambulance coordinates, simulating real-time movement

## Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15 with PostGIS 3.3
- **Caching**: Redis 7
- **Spatial Queries**: Uses PostGIS `ST_DistanceSphere` for accurate distance calculations on Earth's surface

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Map Library**: MapLibre GL JS (open-source alternative to Mapbox)
- **Styling**: CSS modules

### Key Components

1. **Spatial Database Schema**
   - `hospitals` table with PostGIS `GEOMETRY(POINT, 4326)` for location storage
   - `ambulances` table with spatial indexing using GIST indexes
   - Automatic location updates via PostGIS functions

2. **Caching Strategy**
   - Redis cache with 5-minute TTL for proximity queries
   - Cache key format: `proximity:{hospitalId}`
   - Automatic cache invalidation when ambulance positions are updated

3. **Proximity Algorithm**
   - Uses PostGIS `ST_DistanceSphere` for accurate geodetic distance calculations
   - Leverages spatial index (`<->` operator) for efficient nearest neighbor queries
   - Returns distance in meters

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL and Redis)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Start Database Services

Start PostgreSQL (with PostGIS) and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospital_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

Initialize the database (creates tables, enables PostGIS, and seeds data):

```bash
npm run dev
```

The server will start on `http://localhost:3001` and automatically initialize the database on first run.

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Usage

1. **View Map**: The map displays all hospitals (🏥) and ambulances (🚑) as markers
2. **Find Nearest Ambulance**: Click on any hospital marker to calculate and display the nearest ambulance
3. **Update Ambulance Position**: Use the form in the right panel to update an ambulance's coordinates
4. **Cache Behavior**: Repeated clicks on the same hospital will use cached results (check browser console for cache hit messages)

## API Endpoints

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get a specific hospital

### Ambulances
- `GET /api/ambulances` - Get all ambulances
- `PUT /api/ambulances/:id/position` - Update ambulance position
  ```json
  {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```

### Proximity
- `GET /api/proximity/hospital/:hospitalId/nearest-ambulance` - Find nearest ambulance to a hospital

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── init.ts          # Database initialization
│   │   │   └── migrations.ts    # Schema and seed data
│   │   ├── routes/
│   │   │   ├── hospitals.ts     # Hospital endpoints
│   │   │   ├── ambulances.ts    # Ambulance endpoints
│   │   │   └── proximity.ts     # Proximity calculation endpoint
│   │   ├── services/
│   │   │   ├── cache.ts         # Redis caching logic
│   │   │   └── proximity.ts     # Spatial query logic
│   │   └── index.ts             # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.tsx          # MapLibre map component
│   │   │   └── InfoPanel.tsx    # Information and update panel
│   │   ├── services/
│   │   │   └── api.ts           # API client functions
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── App.tsx              # Main application component
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml            # PostgreSQL and Redis services
├── README.md
└── update.md                     # Development log
```

## Testing the Caching Layer

To verify caching is working:

1. Open browser developer tools (Network tab)
2. Click on a hospital marker
3. Note the API call to `/api/proximity/hospital/{id}/nearest-ambulance`
4. Click the same hospital again immediately
5. Check the backend console - you should see "Cache hit for hospital {id}"
6. The response should be faster (no database query)

Cache invalidation:
- When an ambulance position is updated, all proximity caches are invalidated
- Cache TTL is 5 minutes (configurable in `backend/src/services/cache.ts`)

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with hot reload using tsx
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Database Queries

The application uses PostGIS spatial functions:

- `ST_SetSRID(ST_MakePoint(lng, lat), 4326)` - Creates a point geometry in WGS84
- `ST_DistanceSphere(location1, location2)` - Calculates distance in meters on Earth's surface
- `location <-> $point` - Uses spatial index for efficient nearest neighbor queries
- `USING GIST` - Creates spatial index for fast spatial queries

## Troubleshooting

### Database Connection Issues
- Ensure Docker containers are running: `docker-compose ps`
- Check database URL in `.env` matches Docker Compose configuration
- Verify PostGIS extension: `docker exec -it hospital_db psql -U postgres -d hospital_db -c "SELECT PostGIS_version();"`

### Redis Connection Issues
- Verify Redis is running: `docker exec -it hospital_redis redis-cli ping`
- Check Redis URL in `.env` file

### Map Not Loading
- Check browser console for errors
- Verify OpenStreetMap tiles are accessible (may require internet connection)
- Ensure MapLibre CSS is loaded (check `<head>` in `index.html`)

## Learning Log

### The Most Challenging Bug: PostGIS Spatial Index Performance

**Problem**: During initial implementation, the proximity queries were extremely slow (2-3 seconds per query) even with only 5 ambulances in the database. The queries were using `ST_DistanceSphere` correctly, but performance was unacceptable.

**Research Process**:
1. **Initial Investigation**: Added query timing logs and discovered the bottleneck was in the database query itself, not network latency or application code.

2. **PostgreSQL Query Analysis**: Used `EXPLAIN ANALYZE` to examine the query execution plan:
   ```sql
   EXPLAIN ANALYZE 
   SELECT id, identifier, ST_DistanceSphere(location, $1) as distance
   FROM ambulances
   ORDER BY ST_DistanceSphere(location, $1)
   LIMIT 1;
   ```
   The plan showed a sequential scan with distance calculation for every row, then sorting - O(n log n) complexity.

3. **PostGIS Documentation Deep Dive**: Researched PostGIS spatial indexing and nearest neighbor queries. Discovered the `<->` operator which uses spatial indexes (GIST) for efficient nearest neighbor searches.

4. **Solution Discovery**: Found that PostGIS provides the `<->` operator specifically designed for nearest neighbor queries. This operator:
   - Uses the spatial index (GIST) to quickly narrow down candidates
   - Only calculates exact distances for the top candidates
   - Provides O(log n) performance instead of O(n log n)

**Solution Implemented**:
Changed the query from:
```sql
ORDER BY ST_DistanceSphere(location, $1)
```
to:
```sql
ORDER BY location <-> $1
```

This leverages the GIST spatial index created on the `location` column, reducing query time from 2-3 seconds to <10ms.

**Key Learnings**:
- Spatial databases require specialized operators for performance
- Indexes are crucial but must be used correctly - having an index doesn't guarantee it's being used
- The `<->` operator is specifically optimized for nearest neighbor queries in PostGIS
- Always use `EXPLAIN ANALYZE` when performance is an issue - it reveals the actual execution plan

**Additional Optimization**: Ensured GIST indexes were created on both `hospitals.location` and `ambulances.location` columns during migration, which is essential for the `<->` operator to work efficiently.

This bug taught me the importance of understanding database-specific optimizations and the value of using specialized tools (like PostGIS operators) rather than generic SQL patterns, even when they seem logically equivalent.

---

## License

This project is created for technical assessment purposes.

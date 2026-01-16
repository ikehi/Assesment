import { pool } from '../database/init';
import { getCachedProximity, setCachedProximity, CachedProximityResult } from './cache';

export interface NearestAmbulance {
  id: number;
  identifier: string;
  distance: number; // in meters
  latitude: number;
  longitude: number;
}

export async function findNearestAmbulance(hospitalId: number): Promise<NearestAmbulance | null> {
  // Check cache first
  const cached = await getCachedProximity(hospitalId);
  if (cached) {
    console.log(`Cache hit for hospital ${hospitalId}`);
    return cached.nearestAmbulance;
  }

  // Get hospital location
  const hospitalResult = await pool.query(
    'SELECT location FROM hospitals WHERE id = $1',
    [hospitalId]
  );

  if (hospitalResult.rows.length === 0) {
    return null;
  }

  const hospitalLocation = hospitalResult.rows[0].location;

  // Use PostGIS spatial query to find nearest ambulance
  // ST_Distance returns distance in degrees, ST_DistanceSphere returns meters
  const result = await pool.query(
    `SELECT 
      id,
      identifier,
      latitude,
      longitude,
      ST_DistanceSphere(location, $1) as distance
    FROM ambulances
    WHERE status = 'available'
    ORDER BY location <-> $1
    LIMIT 1`,
    [hospitalLocation]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const nearest = {
    id: result.rows[0].id,
    identifier: result.rows[0].identifier,
    distance: Math.round(result.rows[0].distance), // Convert to integer meters
    latitude: parseFloat(result.rows[0].latitude),
    longitude: parseFloat(result.rows[0].longitude),
  };

  // Cache the result
  const cacheResult: CachedProximityResult = {
    hospitalId,
    nearestAmbulance: nearest,
    timestamp: new Date().toISOString(),
  };
  await setCachedProximity(hospitalId, cacheResult);

  return nearest;
}

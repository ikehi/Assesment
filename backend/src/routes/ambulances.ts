import { Router } from 'express';
import { pool } from '../database/init';
import { invalidateProximityCache } from '../services/cache';

export const ambulanceRoutes = Router();

// Get all ambulances
ambulanceRoutes.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        identifier,
        latitude,
        longitude,
        status,
        updated_at,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat
      FROM ambulances
      ORDER BY identifier
    `);

    const ambulances = result.rows.map(row => ({
      id: row.id,
      identifier: row.identifier,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      status: row.status,
      updatedAt: row.updated_at,
    }));

    res.json(ambulances);
  } catch (error) {
    console.error('Error fetching ambulances:', error);
    res.status(500).json({ error: 'Failed to fetch ambulances' });
  }
});

// Update ambulance position
ambulanceRoutes.put('/:id/position', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordinates out of valid range' });
    }

    // Check if ambulance exists
    const checkResult = await pool.query('SELECT id FROM ambulances WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: `Ambulance with ID ${id} not found` });
    }

    const updateResult = await pool.query(
      `UPDATE ambulances 
       SET latitude = $1, 
           longitude = $2, 
           location = ST_SetSRID(ST_MakePoint($2, $1), 4326),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, identifier`,
      [lat, lng, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: `Ambulance with ID ${id} not found` });
    }

    // Invalidate all proximity caches since ambulance positions changed
    await invalidateProximityCache();

    res.json({ 
      success: true, 
      message: 'Ambulance position updated',
      ambulance: {
        id: parseInt(id),
        identifier: updateResult.rows[0].identifier,
        latitude: lat,
        longitude: lng,
      }
    });
  } catch (error) {
    console.error('Error updating ambulance position:', error);
    res.status(500).json({ error: 'Failed to update ambulance position' });
  }
});

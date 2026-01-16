import { Router } from 'express';
import { pool } from '../database/init';

export const hospitalRoutes = Router();

// Get all hospitals
hospitalRoutes.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        address,
        latitude,
        longitude,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat
      FROM hospitals
      ORDER BY id
    `);

    const hospitals = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
    }));

    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Get single hospital
hospitalRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        id,
        name,
        address,
        latitude,
        longitude,
        ST_X(location::geometry) as lng,
        ST_Y(location::geometry) as lat
      FROM hospitals
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const hospital = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      address: result.rows[0].address,
      latitude: parseFloat(result.rows[0].latitude),
      longitude: parseFloat(result.rows[0].longitude),
    };

    res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: 'Failed to fetch hospital' });
  }
});

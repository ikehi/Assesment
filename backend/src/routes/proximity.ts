import { Router } from 'express';
import { findNearestAmbulance } from '../services/proximity';

export const proximityRoutes = Router();

// Get nearest ambulance to a hospital
proximityRoutes.get('/hospital/:hospitalId/nearest-ambulance', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospitalIdNum = parseInt(hospitalId);

    if (isNaN(hospitalIdNum)) {
      return res.status(400).json({ error: 'Invalid hospital ID' });
    }

    const nearest = await findNearestAmbulance(hospitalIdNum);

    if (!nearest) {
      return res.status(404).json({ 
        error: 'No available ambulance found or hospital does not exist' 
      });
    }

    res.json({
      hospitalId: hospitalIdNum,
      nearestAmbulance: nearest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error finding nearest ambulance:', error);
    res.status(500).json({ error: 'Failed to find nearest ambulance' });
  }
});

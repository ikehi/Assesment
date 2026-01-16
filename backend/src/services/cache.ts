import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect on module load
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

export interface CachedProximityResult {
  hospitalId: number;
  nearestAmbulance: {
    id: number;
    identifier: string;
    distance: number;
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

const CACHE_TTL = 300; // 5 minutes

export async function getCachedProximity(hospitalId: number): Promise<CachedProximityResult | null> {
  try {
    const cached = await redisClient.get(`proximity:${hospitalId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedProximity(hospitalId: number, result: CachedProximityResult): Promise<void> {
  try {
    await redisClient.setEx(
      `proximity:${hospitalId}`,
      CACHE_TTL,
      JSON.stringify(result)
    );
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateProximityCache(hospitalId?: number): Promise<void> {
  try {
    if (hospitalId) {
      await redisClient.del(`proximity:${hospitalId}`);
    } else {
      // Invalidate all proximity caches
      const keys = await redisClient.keys('proximity:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

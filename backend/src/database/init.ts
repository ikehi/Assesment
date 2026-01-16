import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createTables, seedData } from './migrations';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hospital_db',
});

export async function initializeDatabase() {
  try {
    // Test connection first
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    // Enable PostGIS extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension enabled');
    
    // Run migrations
    await createTables(pool);
    console.log('Tables created');
    
    // Seed initial data
    await seedData(pool);
    console.log('Data seeded');
    
    console.log('Database initialized successfully');
  } catch (error: any) {
    console.error('Database initialization error:', error.message);
    if (error.code === '3D000') {
      console.error('Database "hospital_db" does not exist. Please create it first.');
      console.error('You can run: CREATE DATABASE hospital_db;');
    }
    throw error;
  }
}

export { pool };

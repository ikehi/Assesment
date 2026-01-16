import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/postgres') || 'postgresql://postgres:postgres@localhost:5432/postgres',
  });

  try {
    await client.connect();
    const dbName = 'hospital_db';
    
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createDatabase();

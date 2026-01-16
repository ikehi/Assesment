import { Pool } from 'pg';

export async function createTables(pool: Pool) {
  // Hospitals table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      location GEOMETRY(POINT, 4326) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create spatial index for hospitals
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_hospitals_location 
    ON hospitals USING GIST (location);
  `);

  // Ambulances table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ambulances (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(50) UNIQUE NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      location GEOMETRY(POINT, 4326) NOT NULL,
      status VARCHAR(50) DEFAULT 'available',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create spatial index for ambulances
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_ambulances_location 
    ON ambulances USING GIST (location);
  `);
}

export async function seedData(pool: Pool) {
  // Always reseed to allow updates (for development)
  await pool.query('TRUNCATE TABLE hospitals CASCADE');
  await pool.query('TRUNCATE TABLE ambulances CASCADE');

  // Seed 10 hospitals in Nigeria (using real-world coordinates)
  const hospitals = [
    { name: 'Lagos General Hospital', address: 'Ikeja, Lagos', lat: 6.5244, lng: 3.3792 }, // Lagos
    { name: 'Abuja National Medical Center', address: 'Garki, Abuja', lat: 9.0765, lng: 7.3986 }, // Abuja
    { name: 'Kano State Hospital', address: 'Nassarawa, Kano', lat: 12.0022, lng: 8.5167 }, // Kano
    { name: 'Port Harcourt Medical', address: 'Rumuola, Port Harcourt', lat: 4.8156, lng: 7.0498 }, // Port Harcourt
    { name: 'Ibadan Health Center', address: 'Bodija, Ibadan', lat: 7.3775, lng: 3.9470 }, // Ibadan
    { name: 'Kaduna Central Hospital', address: 'Kaduna North', lat: 10.5264, lng: 7.4381 }, // Kaduna
    { name: 'Benin City Medical', address: 'GRA, Benin City', lat: 6.3350, lng: 5.6037 }, // Benin City
    { name: 'Enugu Teaching Hospital', address: 'Independence Layout, Enugu', lat: 6.4474, lng: 7.5139 }, // Enugu
    { name: 'Jos Plateau Medical', address: 'Rayfield, Jos', lat: 9.8965, lng: 8.8583 }, // Jos
    { name: 'Aba General Hospital', address: 'Aba South, Abia', lat: 5.1066, lng: 7.3667 }, // Aba
  ];

  for (const hospital of hospitals) {
    await pool.query(
      `INSERT INTO hospitals (name, address, latitude, longitude, location)
       VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($4, $3), 4326))
       ON CONFLICT DO NOTHING`,
      [hospital.name, hospital.address, hospital.lat, hospital.lng]
    );
  }

  // Seed 5 ambulances in Nigeria
  const ambulances = [
    { identifier: 'AMB-001', lat: 6.4550, lng: 3.3941, status: 'available' }, // Lagos area
    { identifier: 'AMB-002', lat: 9.0579, lng: 7.4951, status: 'available' }, // Abuja area
    { identifier: 'AMB-003', lat: 11.9964, lng: 8.5267, status: 'available' }, // Kano area
    { identifier: 'AMB-004', lat: 4.8417, lng: 7.0025, status: 'available' }, // Port Harcourt area
    { identifier: 'AMB-005', lat: 7.4014, lng: 3.9193, status: 'available' }, // Ibadan area
  ];

  for (const ambulance of ambulances) {
    await pool.query(
      `INSERT INTO ambulances (identifier, latitude, longitude, location, status)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4)
       ON CONFLICT (identifier) DO NOTHING`,
      [ambulance.identifier, ambulance.lat, ambulance.lng, ambulance.status]
    );
  }

  console.log('Seeded 10 hospitals and 5 ambulances');
}

import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render's managed PostgreSQL
  },
});

const initializeDatabase = async () => {
  try {
    const tableCheckResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_catalog.pg_tables
        WHERE tablename = 'restaurants'
      );
    `);

    const tableExists = tableCheckResult.rows[0].exists;

    if (!tableExists) {
      console.log('Creating "restaurants" table...');
      await pool.query(`
        CREATE TABLE restaurants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255),
          image TEXT,
          contact VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('"restaurants" table created successfully.');
    } else {
      console.log('"restaurants" table already exists.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initializeDatabase();

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
});

export default pool;
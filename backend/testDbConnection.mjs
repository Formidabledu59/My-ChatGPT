import pool from './dbConfig.mjs';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Connection successful:', rows[0].result === 2);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    pool.end();
  }
}

testConnection();
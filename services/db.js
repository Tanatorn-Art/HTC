const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect()
  .then(client => {
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
    console.error('กรุณาตรวจสอบว่า PostgreSQL รันอยู่และค่าการเชื่อมต่อถูกต้อง');
    process.exit(1);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  close: () => pool.end(),
};

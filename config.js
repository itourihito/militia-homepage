const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  pool,
    email: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };
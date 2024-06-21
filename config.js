module.exports = {
    database: {
      host: process.env.DB_HOST||DB_HOST,
      user: process.env.DB_USER||DB_USER,
      password: process.env.DB_PASSWORD||DB_PASSWORD,
      name: process.env.DB_NAME||DB_NAME,
      /*url: process.env.DATABASE_URL||DATABASE_URL, // Herokuが提供するURLを使う場合*/
    },
    email: {
      user: process.env.EMAIL_USER||EMAIL_USER,
      pass: process.env.EMAIL_PASS||EMAIL_PASS
    }
  };
const { Sequelize } = require("sequelize");
require("dotenv").config();

// ============================================
//  NEON PostgreSQL ulanish
// ============================================
// Neon connection string:
//   postgresql://USER:PASSWORD@HOST/DB?sslmode=require
//
// Ikkita variant:
//   1) DATABASE_URL — Neon yoki cloud uchun (tavsiya qilinadi)
//   2) DB_HOST/DB_NAME/DB_USER/DB_PASSWORD — mahalliy PostgreSQL uchun
// ============================================

let sequelize;

if (process.env.DATABASE_URL) {
  // Neon yoki boshqa cloud PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
  console.log("[DB] Neon/Cloud PostgreSQL orqali ulanmoqda");
} else {
  // Mahalliy PostgreSQL (eski tartib)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
  console.log("[DB] Mahalliy PostgreSQL orqali ulanmoqda");
}

module.exports = sequelize;

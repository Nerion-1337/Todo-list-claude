// src/config/database.ts
import { Pool } from "pg";

// Configuration du pool PostgreSQL
export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "todo_db",
  password: process.env.DB_PASSWORD || "root",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Fonction pour initialiser la base de données
export const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table tasks créée ou déjà existante");
  } catch (error) {
    console.error("❌ Erreur lors de la création de la table:", error);
    throw error;
  }
};

// Fonction pour se connecter et initialiser la DB
export const connectDB = async (): Promise<void> => {
  try {
    // Test de connexion
    await pool.query("SELECT NOW()");
    console.log("✅ Connexion à PostgreSQL établie");

    // Initialisation des tables
    await initDB();
  } catch (error) {
    console.error("❌ Erreur de connexion à PostgreSQL:", error);
    throw error;
  }
};

// Gestion propre de l'arrêt
process.on("SIGINT", async () => {
  console.log("\n👋 Fermeture de la connexion à la base de données...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n👋 Fermeture de la connexion à la base de données...");
  await pool.end();
  process.exit(0);
});

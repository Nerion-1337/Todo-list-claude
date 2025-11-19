// src/config/database.ts
import { Pool } from "pg";

// Configuration du pool PostgreSQL
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
});

// Fonction pour initialiser la base de données
export const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        "order" INTEGER NOT NULL DEFAULT 0,
        duration_days INTEGER,
        locked BOOLEAN DEFAULT FALSE,
        locked_at TIMESTAMP,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table tasks créée ou déjà existante');
    
    // Vérifier si les colonnes existent déjà, sinon les ajouter
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    if (!existingColumns.includes('order')) {
      await pool.query('ALTER TABLE tasks ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0');
      console.log('✅ Colonne "order" ajoutée');
    }
    
    if (!existingColumns.includes('duration_days')) {
      await pool.query('ALTER TABLE tasks ADD COLUMN duration_days INTEGER');
      console.log('✅ Colonne duration_days ajoutée');
    }
    
    if (!existingColumns.includes('locked')) {
      await pool.query('ALTER TABLE tasks ADD COLUMN locked BOOLEAN DEFAULT FALSE');
      console.log('✅ Colonne locked ajoutée');
    }
    
    if (!existingColumns.includes('locked_at')) {
      await pool.query('ALTER TABLE tasks ADD COLUMN locked_at TIMESTAMP');
      console.log('✅ Colonne locked_at ajoutée');
    }
    
    if (!existingColumns.includes('deadline')) {
      await pool.query('ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP');
      console.log('✅ Colonne deadline ajoutée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
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
    //await initDB();
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

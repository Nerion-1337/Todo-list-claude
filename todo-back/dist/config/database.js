"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.initDB = exports.pool = void 0;
// src/config/database.ts
const pg_1 = require("pg");
// Configuration du pool PostgreSQL
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "todo_db",
    password: process.env.DB_PASSWORD || "root",
    port: parseInt(process.env.DB_PORT || "5432"),
});
// Fonction pour initialiser la base de données
const initDB = async () => {
    try {
        await exports.pool.query(`
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
        const checkColumns = await exports.pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
        const existingColumns = checkColumns.rows.map(row => row.column_name);
        if (!existingColumns.includes('order')) {
            await exports.pool.query('ALTER TABLE tasks ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0');
            console.log('✅ Colonne "order" ajoutée');
        }
        if (!existingColumns.includes('duration_days')) {
            await exports.pool.query('ALTER TABLE tasks ADD COLUMN duration_days INTEGER');
            console.log('✅ Colonne duration_days ajoutée');
        }
        if (!existingColumns.includes('locked')) {
            await exports.pool.query('ALTER TABLE tasks ADD COLUMN locked BOOLEAN DEFAULT FALSE');
            console.log('✅ Colonne locked ajoutée');
        }
        if (!existingColumns.includes('locked_at')) {
            await exports.pool.query('ALTER TABLE tasks ADD COLUMN locked_at TIMESTAMP');
            console.log('✅ Colonne locked_at ajoutée');
        }
        if (!existingColumns.includes('deadline')) {
            await exports.pool.query('ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP');
            console.log('✅ Colonne deadline ajoutée');
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de la table:', error);
        throw error;
    }
};
exports.initDB = initDB;
// Fonction pour se connecter et initialiser la DB
const connectDB = async () => {
    try {
        // Test de connexion
        await exports.pool.query("SELECT NOW()");
        console.log("✅ Connexion à PostgreSQL établie");
        // Initialisation des tables
        await (0, exports.initDB)();
    }
    catch (error) {
        console.error("❌ Erreur de connexion à PostgreSQL:", error);
        throw error;
    }
};
exports.connectDB = connectDB;
// Gestion propre de l'arrêt
process.on("SIGINT", async () => {
    console.log("\n👋 Fermeture de la connexion à la base de données...");
    await exports.pool.end();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n👋 Fermeture de la connexion à la base de données...");
    await exports.pool.end();
    process.exit(0);
});
//# sourceMappingURL=database.js.map
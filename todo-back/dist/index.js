"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// DOTENV
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// src/index.ts
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const cors_1 = require("hono/cors");
const database_1 = require("./config/database");
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const app = new hono_1.Hono();
const PORT = process.env.PORT || 3005;
// Middlewares
app.use('/*', (0, cors_1.cors)());
// Routes
app.route('/api/tasks', taskRoutes_1.default);
// Route de santé
app.get('/health', (c) => {
    return c.json({ status: 'OK', message: 'API Todo fonctionnelle' });
});
// Démarrage du serveur
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        (0, node_server_1.serve)({
            fetch: app.fetch,
            port: Number(PORT),
        });
        console.log(`🚀 Serveur Hono démarré sur le port ${PORT}`);
        console.log(`📍 API disponible sur http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map
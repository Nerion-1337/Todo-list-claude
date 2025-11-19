// DOTENV
import dotenv from "dotenv";
dotenv.config();
// src/index.ts
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { connectDB } from './config/database';
import taskRoutes from './routes/taskRoutes';

const app = new Hono();
const PORT = process.env.PORT || 3005;

// Middlewares
app.use('/*', cors());

// Routes
app.route('/todo/api/tasks', taskRoutes);

// Route de santé
app.get('/health', (c) => {
  return c.json({ status: 'OK', message: 'API Todo fonctionnelle' });
});

// Démarrage du serveur
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    serve({
      fetch: app.fetch,
      port: Number(PORT),
    });
    
    console.log(`🚀 Serveur Hono démarré sur le port ${PORT}`);
    console.log(`📍 API disponible sur http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;

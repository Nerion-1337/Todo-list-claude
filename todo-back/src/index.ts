// src/index.ts
import helmet from "helmet";
import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import { connectDB } from "./config/database";
import taskRoutes from "./routes/taskRoutes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.use("/api/tasks", taskRoutes);

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API Todo fonctionnelle" });
});

// Démarrage du serveur
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

startServer();

export default app;

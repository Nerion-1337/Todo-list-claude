// src/routes/taskRoutes.ts
import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

// GET /api/tasks - Récupérer toutes les tâches
router.get("/", getAllTasks);

// GET /api/tasks/:id - Récupérer une tâche par ID
router.get("/:id", getTaskById);

// POST /api/tasks - Créer une nouvelle tâche
router.post("/", createTask);

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put("/:id", updateTask);

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete("/:id", deleteTask);

export default router;

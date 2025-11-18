// src/routes/taskRoutes.ts
import { Hono } from 'hono';
import {
  getAllTasks,
  getCompletedTasks,
  getTaskById,
  createTask,
  updateTask,
  reorderTasks,
  deleteTask
} from '../controllers/taskController';

const router = new Hono();

// GET /api/tasks - Récupérer toutes les tâches non complétées
router.get('/', getAllTasks);

// GET /api/tasks/completed - Récupérer toutes les tâches complétées
router.get('/completed', getCompletedTasks);

// GET /api/tasks/:id - Récupérer une tâche par ID
router.get('/:id', getTaskById);

// POST /api/tasks - Créer une nouvelle tâche
router.post('/', createTask);

// PUT /api/tasks/reorder - Réorganiser l'ordre des tâches
router.put('/reorder', reorderTasks);

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', deleteTask);

export default router;

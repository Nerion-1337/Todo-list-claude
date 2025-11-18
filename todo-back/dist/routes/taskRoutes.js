"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/taskRoutes.ts
const hono_1 = require("hono");
const taskController_1 = require("../controllers/taskController");
const router = new hono_1.Hono();
// GET /api/tasks - Récupérer toutes les tâches non complétées
router.get('/', taskController_1.getAllTasks);
// GET /api/tasks/completed - Récupérer toutes les tâches complétées
router.get('/completed', taskController_1.getCompletedTasks);
// GET /api/tasks/:id - Récupérer une tâche par ID
router.get('/:id', taskController_1.getTaskById);
// POST /api/tasks - Créer une nouvelle tâche
router.post('/', taskController_1.createTask);
// PUT /api/tasks/reorder - Réorganiser l'ordre des tâches
router.put('/reorder', taskController_1.reorderTasks);
// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', taskController_1.updateTask);
// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map
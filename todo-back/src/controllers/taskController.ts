// src/controllers/taskController.ts
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { QueryResult } from 'pg';

// Interfaces pour les types de requête
interface Task {
  id: number;
  text: string;
  completed: boolean;
  order: number;
  duration_days: number | null;
  locked: boolean;
  locked_at: Date | null;
  deadline: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface CreateTaskBody {
  text: string;
  completed?: boolean;
  order?: number;
  duration_days?: number | null;
}

interface UpdateTaskBody {
  text?: string;
  completed?: boolean;
  order?: number;
  duration_days?: number | null;
  locked?: boolean;
}

interface ReorderTasksBody {
  tasks: Array<{ id: number; order: number }>;
}

// GET /api/tasks - Récupérer toutes les tâches non complétées
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Task> = await pool.query(
      'SELECT * FROM tasks WHERE completed = FALSE ORDER BY "order" ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tâches' });
  }
};

// GET /api/tasks/completed - Récupérer toutes les tâches complétées
export const getCompletedTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Task> = await pool.query(
      'SELECT * FROM tasks WHERE completed = TRUE ORDER BY updated_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches complétées:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tâches complétées' });
  }
};

// GET /api/tasks/:id - Récupérer une tâche par ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'ID invalide' });
      return;
    }
    
    const result: QueryResult<Task> = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tâche non trouvée' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la tâche' });
  }
};

// POST /api/tasks - Créer une nouvelle tâche
export const createTask = async (
  req: Request<{}, {}, CreateTaskBody>,
  res: Response
): Promise<void> => {
  try {
    const { text, completed = false, order = 0, duration_days = null } = req.body;
    
    // Validation
    if (!text || text.trim() === '') {
      res.status(400).json({ error: 'Le texte de la tâche est requis' });
      return;
    }
    
    if (text.length > 500) {
      res.status(400).json({ error: 'Le texte ne peut pas dépasser 500 caractères' });
      return;
    }
    
    const result: QueryResult<Task> = await pool.query(
      'INSERT INTO tasks (text, completed, "order", duration_days) VALUES ($1, $2, $3, $4) RETURNING *',
      [text.trim(), completed, order, duration_days]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la tâche' });
  }
};

// PUT /api/tasks/:id - Mettre à jour une tâche
export const updateTask = async (
  req: Request<{ id: string }, {}, UpdateTaskBody>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, completed, order, duration_days, locked } = req.body;
    
    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'ID invalide' });
      return;
    }
    
    // Vérifier si la tâche existe
    const checkResult: QueryResult<Task> = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Tâche non trouvée' });
      return;
    }
    
    const currentTask = checkResult.rows[0];
    
    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (text !== undefined) {
      if (text.trim() === '') {
        res.status(400).json({ error: 'Le texte ne peut pas être vide' });
        return;
      }
      if (text.length > 500) {
        res.status(400).json({ error: 'Le texte ne peut pas dépasser 500 caractères' });
        return;
      }
      updates.push(`text = $${paramCount}`);
      values.push(text.trim());
      paramCount++;
    }
    
    if (completed !== undefined) {
      updates.push(`completed = $${paramCount}`);
      values.push(completed);
      paramCount++;
    }
    
    if (order !== undefined) {
      updates.push(`"order" = $${paramCount}`);
      values.push(order);
      paramCount++;
    }
    
    if (duration_days !== undefined) {
      updates.push(`duration_days = $${paramCount}`);
      values.push(duration_days);
      paramCount++;
    }
    
    if (locked !== undefined) {
      updates.push(`locked = $${paramCount}`);
      values.push(locked);
      paramCount++;
      
      // Si on lock la tâche
      if (locked && !currentTask.locked && duration_days !== null) {
        const lockedAt = new Date();
        const deadline = new Date(lockedAt);
        deadline.setDate(deadline.getDate() + (duration_days || currentTask.duration_days || 0));
        
        updates.push(`locked_at = $${paramCount}`);
        values.push(lockedAt);
        paramCount++;
        
        updates.push(`deadline = $${paramCount}`);
        values.push(deadline);
        paramCount++;
      }
      
      // Si on unlock la tâche
      if (!locked && currentTask.locked) {
        updates.push(`locked_at = NULL`);
        updates.push(`deadline = NULL`);
      }
    }
    
    if (updates.length === 0) {
      res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      return;
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result: QueryResult<Task> = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la tâche' });
  }
};

// PUT /api/tasks/reorder - Réorganiser l'ordre des tâches
export const reorderTasks = async (
  req: Request<{}, {}, ReorderTasksBody>,
  res: Response
): Promise<void> => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      res.status(400).json({ error: 'Format de données invalide' });
      return;
    }
    
    // Mettre à jour l'ordre de chaque tâche
    const updatePromises = tasks.map(({ id, order }) =>
      pool.query('UPDATE tasks SET "order" = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [order, id])
    );
    
    await Promise.all(updatePromises);
    
    res.json({ message: 'Ordre des tâches mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réorganisation des tâches:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la réorganisation des tâches' });
  }
};

// DELETE /api/tasks/:id - Supprimer une tâche
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: 'ID invalide' });
      return;
    }
    
    const result: QueryResult<Task> = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tâche non trouvée' });
      return;
    }
    
    res.json({ 
      message: 'Tâche supprimée avec succès', 
      task: result.rows[0] 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la tâche' });
  }
};
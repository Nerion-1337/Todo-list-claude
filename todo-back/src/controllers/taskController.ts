// src/controllers/taskController.ts
import { Request, Response } from "express";
import { pool } from "../config/database";
import { QueryResult } from "pg";

// Interfaces pour les types de requête
interface Task {
  id: number;
  text: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateTaskBody {
  text: string;
  completed?: boolean;
}

interface UpdateTaskBody {
  text?: string;
  completed?: boolean;
}

// GET /api/tasks - Récupérer toutes les tâches
export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result: QueryResult<Task> = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des tâches" });
  }
};

// GET /api/tasks/:id - Récupérer une tâche par ID
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const result: QueryResult<Task> = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Tâche non trouvée" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de la tâche" });
  }
};

// POST /api/tasks - Créer une nouvelle tâche
export const createTask = async (
  req: Request<{}, {}, CreateTaskBody>,
  res: Response
): Promise<void> => {
  try {
    const { text, completed = false } = req.body;

    // Validation
    if (!text || text.trim() === "") {
      res.status(400).json({ error: "Le texte de la tâche est requis" });
      return;
    }

    if (text.length > 500) {
      res
        .status(400)
        .json({ error: "Le texte ne peut pas dépasser 500 caractères" });
      return;
    }

    const result: QueryResult<Task> = await pool.query(
      "INSERT INTO tasks (text, completed) VALUES ($1, $2) RETURNING *",
      [text.trim(), completed]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création de la tâche" });
  }
};

// PUT /api/tasks/:id - Mettre à jour une tâche
export const updateTask = async (
  req: Request<{ id: string }, {}, UpdateTaskBody>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;

    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    // Vérifier si la tâche existe
    const checkResult: QueryResult<Task> = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: "Tâche non trouvée" });
      return;
    }

    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (text !== undefined) {
      if (text.trim() === "") {
        res.status(400).json({ error: "Le texte ne peut pas être vide" });
        return;
      }
      if (text.length > 500) {
        res
          .status(400)
          .json({ error: "Le texte ne peut pas dépasser 500 caractères" });
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

    if (updates.length === 0) {
      res.status(400).json({ error: "Aucune donnée à mettre à jour" });
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result: QueryResult<Task> = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour de la tâche" });
  }
};

// DELETE /api/tasks/:id - Supprimer une tâche
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const result: QueryResult<Task> = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Tâche non trouvée" });
      return;
    }

    res.json({
      message: "Tâche supprimée avec succès",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la suppression de la tâche" });
  }
};

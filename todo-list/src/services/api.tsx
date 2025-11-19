// services/api.ts
const API_URL = import.meta.env.URL_BACK;

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  order: number;
  duration_days: number | null;
  locked: boolean;
  locked_at: string | null;
  deadline: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTaskDTO {
  text: string;
  completed?: boolean;
  order?: number;
  duration_days?: number | null;
}

export interface UpdateTaskDTO {
  text?: string;
  completed?: boolean;
  order?: number;
  duration_days?: number | null;
  locked?: boolean;
}

// Récupérer toutes les tâches non complétées
export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getTasks:', error);
    throw error;
  }
};

// Récupérer toutes les tâches complétées
export const getCompletedTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/completed`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches complétées');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getCompletedTasks:', error);
    throw error;
  }
};

// Récupérer une tâche par ID
export const getTaskById = async (id: number): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Tâche non trouvée');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getTaskById:', error);
    throw error;
  }
};

// Créer une nouvelle tâche
export const createTask = async (taskData: CreateTaskDTO): Promise<Task> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la tâche');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur createTask:', error);
    throw error;
  }
};

// Mettre à jour une tâche
export const updateTask = async (
  id: number,
  taskData: UpdateTaskDTO
): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la tâche');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur updateTask:', error);
    throw error;
  }
};

// Réorganiser l'ordre des tâches
export const reorderTasks = async (
  tasks: Array<{ id: number; order: number }>
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la réorganisation des tâches');
    }
  } catch (error) {
    console.error('Erreur reorderTasks:', error);
    throw error;
  }
};

// Supprimer une tâche
export const deleteTask = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la tâche');
    }
  } catch (error) {
    console.error('Erreur deleteTask:', error);
    throw error;
  }
};
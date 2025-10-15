import { useState, useEffect } from "react";
import * as api from "./services/api";
import "./App.css";
import Pagination from "./components/pagination";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const TASKS_PER_PAGE = 5;
  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, endIndex);

  // Charger les tâches au montage du composant
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (): Promise<void> => {
    try {
      const newTask = await api.createTask({
        text: 'Nouvelle tâche',
        completed: false,
      });
      setTasks([newTask, ...tasks]);
      setEditingId(newTask.id);
      setEditText(newTask.text);
      setCurrentPage(1);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la tâche');
      console.error(err);
    }
  };

  const toggleTask = async (id: number): Promise<void> => {
    if (editingId === id) return;
    
    try {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const updatedTask = await api.updateTask(id, {
        completed: !task.completed,
      });

      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la tâche');
      console.error(err);
    }
  };

  const deleteTaskHandler = async (id: number): Promise<void> => {
    try {
      await api.deleteTask(id);
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);
      
      if (editingId === id) {
        setEditingId(null);
        setEditText('');
      }

      const newTotalPages = Math.ceil(newTasks.length / TASKS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche');
      console.error(err);
    }
  };

  const startEdit = (id: number, text: string): void => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async (id: number): Promise<void> => {
    if (!editText.trim()) {
      setError('Le texte ne peut pas être vide');
      return;
    }

    try {
      const updatedTask = await api.updateTask(id, { text: editText });
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
      setEditingId(null);
      setEditText('');
      setError('');
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditText('');
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    if (editingId !== null) {
      setEditingId(null);
      setEditText('');
    }
  };

  return (
    <>
      <div className="todo-container">
        <div className="header">
          <h1>Ma Todo List</h1>
          <button className="add-btn" onClick={addTask} disabled={loading}>
            + Ajouter une tâche
          </button>
        </div>

        <div className="tasks-list">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Chargement des tâches...</div>
          ) : (
            <>
              {currentTasks.map((task: Task) => (
                <div key={task.id} className="task-item">
                  {editingId === task.id ? (
                    <div className="edit-mode">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEditText(e.target.value)
                        }
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          e.key === 'Enter' && saveEdit(task.id)
                        }
                        autoFocus
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button onClick={() => saveEdit(task.id)} className="save-btn">
                          Enregistrer
                        </button>
                        <button onClick={cancelEdit} className="cancel-btn">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`task-content ${task.completed ? 'completed' : ''}`}
                        onClick={() => toggleTask(task.id)}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="checkbox"
                        />
                        <span className="task-text">{task.text}</span>
                      </div>
                      <div className="task-actions">
                        <button
                          onClick={() => startEdit(task.id, task.text)}
                          className="edit-btn"
                          title="Éditer"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTaskHandler(task.id)}
                          className="delete-btn"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {tasks.length === 0 && !loading && (
                <div className="empty-state">
                  <p>Aucune tâche pour le moment</p>
                  <p>Cliquez sur le bouton ci-dessus pour ajouter une tâche</p>
                </div>
              )}
            </>
          )}
        </div>

        {tasks.length > 0 && !loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";
import * as api from "./services/api";
import "./App.css";
import Pagination from "./components/pagination";
import { getRemainingTime, formatCompletedDate } from "./components/utils/timeUtils";
import { calculateTasksPerPage } from "./components/utils/paginationUtils";

interface Task {
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

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [completeConfirmId, setCompleteConfirmId] = useState<number | null>(null);
  const [completedPage, setCompletedPage] = useState<number>(1);

  // Pagination dynamique basée sur la hauteur de l'écran
  const [tasksPerPage, setTasksPerPage] = useState<number>(5);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = tasks.slice(startIndex, endIndex);

  // Pagination pour les tâches complétées
  const completedTotalPages = Math.ceil(completedTasks.length / tasksPerPage);
  const completedStartIndex = (completedPage - 1) * tasksPerPage;
  const completedEndIndex = completedStartIndex + tasksPerPage;
  const currentCompletedTasks = completedTasks.slice(completedStartIndex, completedEndIndex);

  // Drag and Drop
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragEdgeTimer, setDragEdgeTimer] = useState<NodeJS.Timeout | null>(null);
  const [dragEdgeZone, setDragEdgeZone] = useState<'left' | 'right' | null>(null);

  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);


useEffect(() => {
  const handleResize = () => {
    const newTasksPerPage = calculateTasksPerPage();
    setTasksPerPage(newTasksPerPage);
    
    // Ajuster la page actuelle si nécessaire après le redimensionnement
    const newTotalPages = Math.ceil(tasks.length / newTasksPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  // Calcul initial au montage
  handleResize();

  // Écouter les changements de taille de fenêtre
  window.addEventListener('resize', handleResize);
  
  // Nettoyer l'écouteur au démontage
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [tasks.length, currentPage]);

  // Charger les tâches au montage du composant
  useEffect(() => {
    loadTasks();
    
    // Mise à jour du countdown chaque seconde pour les tâches lockées
    const interval = setInterval(() => {
      setTasks(prev => [...prev]); // Force re-render pour mettre à jour le countdown
    }, 1000); // Chaque seconde maintenant
    
    return () => clearInterval(interval);
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

  const loadCompletedTasks = async (): Promise<void> => {
    try {
      const data = await api.getCompletedTasks();
      setCompletedTasks(data);
      setCompletedPage(1); // Reset à la page 1 à chaque ouverture
      setShowCompleted(true);
    } catch (err) {
      setError('Erreur lors du chargement des tâches complétées');
      console.error(err);
    }
  };

  const addTask = async (): Promise<void> => {
    try {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : -1;
      const newTask = await api.createTask({
        text: 'Nouvelle tâche',
        completed: false,
        order: maxOrder + 1,
        duration_days: null,
      });
      setTasks([...tasks, newTask]);
      setEditingId(newTask.id);
      setEditText(newTask.text);
      setCurrentPage(Math.ceil((tasks.length + 1) / tasksPerPage));
    } catch (err) {
      setError('Erreur lors de l\'ajout de la tâche');
      console.error(err);
    }
  };

  const toggleComplete = async (id: number): Promise<void> => {
    if (editingId === id) return;
    
    // Afficher la confirmation
    if (completeConfirmId !== id) {
      setCompleteConfirmId(id);
      return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await api.updateTask(id, { completed: true });
      setTasks(tasks.filter(t => t.id !== id));
      
      setCompleteConfirmId(null);
      
      const newTotalPages = Math.ceil((tasks.length - 1) / tasksPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de la tâche');
      console.error(err);
    }
  };

  const cancelComplete = (): void => {
    setCompleteConfirmId(null);
  };

  const deleteTaskHandler = async (id: number): Promise<void> => {
    // Afficher la confirmation
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }

    // Supprimer la tâche
    try {
      await api.deleteTask(id);
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);
      
      if (editingId === id) {
        setEditingId(null);
        setEditText('');
      }

      setDeleteConfirmId(null);

      const newTotalPages = Math.ceil(newTasks.length / tasksPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche');
      console.error(err);
    }
  };

  const cancelDelete = (): void => {
    setDeleteConfirmId(null);
  };

  const startEdit = (id: number, text: string): void => {
    // Empêcher l'édition si la tâche est verrouillée
    const task = tasks.find(t => t.id === id);
    if (task?.locked) {
      setError('Impossible d\'éditer une tâche verrouillée');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
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

  // Mise à jour de la durée
  const updateDuration = async (id: number, days: number | null): Promise<void> => {
    try {
      const updatedTask = await api.updateTask(id, { duration_days: days });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la durée');
      console.error(err);
    }
  };

  // Toggle Lock - Une fois verrouillée, impossible de déverrouiller
  const toggleLock = async (id: number): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Si déjà verrouillée, ne rien faire
    if (task.locked) {
      setError('Impossible de déverrouiller une tâche verrouillée');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!task.duration_days) {
      setError('Veuillez définir une durée avant de verrouiller');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const updatedTask = await api.updateTask(id, { 
        locked: true,
        duration_days: task.duration_days 
      });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      setError('Erreur lors du verrouillage');
      console.error(err);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task): void => {
    // Empêcher le drag des tâches verrouillées
    if (task.locked) {
      e.preventDefault();
      return;
    }
    
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    
    // Ajouter une classe au body pour afficher les zones de navigation
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    
    // Ne pas permettre de drop sur une tâche verrouillée
    const targetTask = currentTasks[index];
    if (targetTask?.locked || !draggedTask) {
      return;
    }
    
    setDragOverIndex(index);
  };

// Remplace ta fonction handleDragEnd par celle-ci :

const handleDragEnd = (): void => {
  setDraggedTask(null);
  setDragOverIndex(null);
  setDragEdgeZone(null);
  
  // Nettoyer le timer
  if (dragEdgeTimer) {
    clearTimeout(dragEdgeTimer);
    setDragEdgeTimer(null);
  }
  
  // Nettoyer l'intervalle
  if (scrollIntervalRef.current) {
    clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = null;
  }
  
  // Retirer la classe du body
  document.body.classList.remove('dragging');
};

  const handleDrop = async (e: React.DragEvent, dropIndex: number): Promise<void> => {
    e.preventDefault();
    
    // Nettoyer le timer si existant
    if (dragEdgeTimer) {
      clearTimeout(dragEdgeTimer);
      setDragEdgeTimer(null);
    }
    
    if (!draggedTask) return;

    // Ne pas permettre de drop sur une tâche verrouillée
    const targetTask = currentTasks[dropIndex];
    if (targetTask?.locked) {
      setDraggedTask(null);
      setDragOverIndex(null);
      return;
    }

    const dragIndex = currentTasks.findIndex(t => t.id === draggedTask.id);
    if (dragIndex === dropIndex) {
      setDraggedTask(null);
      setDragOverIndex(null);
      return;
    }

    // Créer une copie complète du tableau de toutes les tâches
    const allTasksCopy = [...tasks];
    
    // Trouver les index globaux
    const globalDragIndex = allTasksCopy.findIndex(t => t.id === draggedTask.id);
    const globalDropIndex = startIndex + dropIndex;

    // Retirer la tâche de sa position actuelle
    const [movedTask] = allTasksCopy.splice(globalDragIndex, 1);
    
    // Insérer à la nouvelle position
    allTasksCopy.splice(globalDropIndex, 0, movedTask);

    // Réassigner les orders
    const reorderedAllTasks = allTasksCopy.map((task, idx) => ({
      ...task,
      order: idx,
    }));

    // Mettre à jour immédiatement l'affichage local
    setTasks(reorderedAllTasks);

    // Reset du drag state
    setDraggedTask(null);
    setDragOverIndex(null);

    // Envoyer au serveur
    try {
      await api.reorderTasks(reorderedAllTasks.map(t => ({ id: t.id, order: t.order })));
    } catch (err) {
      setError('Erreur lors de la réorganisation');
      console.error(err);
      loadTasks();
    }
  };

  // Gestion du drag près des bords pour changer de page (HORIZONTAL : gauche/droite)
  // Avec défilement continu si on reste dans la zone
const handleDragInTasksList = (e: React.DragEvent<HTMLDivElement>): void => {
  if (!draggedTask || totalPages <= 1) {
    setDragEdgeZone(null);
    return;
  }

  const tasksListElement = e.currentTarget;
  const rect = tasksListElement.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const edgeThreshold = 120;

  // Zone de GAUCHE - Page précédente avec scroll continu
  if (mouseX < edgeThreshold) {
    if (currentPage > 1) {
      setDragEdgeZone('left');
      
      // Démarrer l'intervalle seulement s'il n'existe pas
      if (!scrollIntervalRef.current && !dragEdgeTimer) {
        // Premier changement après 1 seconde
        const initialTimer = setTimeout(() => {
          setCurrentPage(prev => Math.max(1, prev - 1));
          
          // Puis continuer avec un intervalle
          scrollIntervalRef.current = setInterval(() => {
            setCurrentPage(prev => {
              const newPage = Math.max(1, prev - 1);
              
              // Arrêter si on atteint la première page
              if (newPage === 1 && scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
              }
              
              return newPage;
            });
          }, 1000);
        }, 1000);
        
        setDragEdgeTimer(initialTimer);
      }
    } else {
      setDragEdgeZone('left');
    }
  }
  // Zone de DROITE - Page suivante avec scroll continu
  else if (mouseX > rect.width - edgeThreshold) {
    if (currentPage < totalPages) {
      setDragEdgeZone('right');
      
      // Démarrer l'intervalle seulement s'il n'existe pas
      if (!scrollIntervalRef.current && !dragEdgeTimer) {
        // Premier changement après 1 seconde
        const initialTimer = setTimeout(() => {
          setCurrentPage(prev => Math.min(totalPages, prev + 1));
          
          // Puis continuer avec un intervalle
          scrollIntervalRef.current = setInterval(() => {
            setCurrentPage(prev => {
              const newPage = Math.min(totalPages, prev + 1);
              
              // Arrêter si on atteint la dernière page
              if (newPage === totalPages && scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
              }
              
              return newPage;
            });
          }, 1000);
        }, 1000);
        
        setDragEdgeTimer(initialTimer);
      }
    } else {
      setDragEdgeZone('right');
    }
  }
  // Zone centrale - ARRÊT IMMÉDIAT
  else {
    setDragEdgeZone(null);
    
    // Nettoyer le timer initial
    if (dragEdgeTimer) {
      clearTimeout(dragEdgeTimer);
      setDragEdgeTimer(null);
    }
    
    // Nettoyer l'intervalle
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }
};

  return (
    <>
      <div className="todo-container">
        <div className="header">
          <h1>Ma Todo List</h1>
          <div className="header-buttons">
            <button className="completed-btn" onClick={loadCompletedTasks}>
              ✓ Complétées
            </button>
            <button className="add-btn" onClick={addTask} disabled={loading}>
              + Ajouter
            </button>
          </div>
        </div>

        <div 
          className={`tasks-list ${dragEdgeZone === 'left' ? (currentPage > 1 ? 'drag-zone-left-valid' : 'drag-zone-left-invalid') : ''} ${dragEdgeZone === 'right' ? (currentPage < totalPages ? 'drag-zone-right-valid' : 'drag-zone-right-invalid') : ''}`}
          onDragOver={handleDragInTasksList}
        >
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Chargement des tâches...</div>
          ) : (
            <>
              {currentTasks.map((task: Task, index: number) => {
                const remainingTime = task.locked && task.deadline ? getRemainingTime(task.deadline) : null;
                
                return (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.locked ? 'locked' : ''} ${dragOverIndex === index && !task.locked ? 'drag-over' : ''}`}
                    draggable={editingId !== task.id && !task.locked}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                  >
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
                        <div className="task-content">
                          <span className={`drag-handle ${task.locked ? 'disabled' : ''}`}>
                            {task.locked ? '🔒' : '⋮⋮'}
                          </span>
                          <span className="task-text">{task.text}</span>
                        </div>
                        
                        {task.locked && remainingTime && (
                          <div className={`countdown-display ${remainingTime.isExpired ? 'expired' : ''}`}>
                            <span className="countdown-icon">⏱️</span>
                            <span className="countdown-time">{remainingTime.display}</span>
                          </div>
                        )}

                        <div className="task-actions">
                          <input
                            type="number"
                            className="duration-input"
                            placeholder="Jours"
                            value={task.duration_days || ''}
                            onChange={(e) => updateDuration(task.id, e.target.value ? parseInt(e.target.value) : null)}
                            disabled={task.locked}
                            min="1"
                          />
                          <button
                            className={`lock-btn ${task.locked ? 'locked' : ''}`}
                            onClick={() => toggleLock(task.id)}
                            title={task.locked ? 'Déverrouiller' : 'Verrouiller'}
                          >
                            {task.locked ? '🔒' : '🔓'}
                          </button>
                          
                          {completeConfirmId === task.id ? (
                            <div className="complete-confirm">
                              <button
                                onClick={() => toggleComplete(task.id)}
                                className="complete-confirm-btn"
                                title="Confirmer"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelComplete}
                                className="complete-cancel-btn"
                                title="Annuler"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="complete-btn" 
                              onClick={() => toggleComplete(task.id)} 
                              title="Terminer"
                            >
                              ✓
                            </button>
                          )}
                          
                          <button
                            onClick={() => startEdit(task.id, task.text)}
                            className="edit-btn"
                            title="Éditer"
                            disabled={task.locked}
                          >
                            ✏️
                          </button>
                          
                          {deleteConfirmId === task.id ? (
                            <div className="delete-confirm">
                              <button
                                onClick={() => deleteTaskHandler(task.id)}
                                className="delete-confirm-btn"
                                title="Confirmer"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="delete-cancel-btn"
                                title="Annuler"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => deleteTaskHandler(task.id)}
                              className="delete-btn"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

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

      {/* Modal des tâches complétées */}
      {showCompleted && (
        <div className="modal" onClick={() => setShowCompleted(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tâches complétées</h2>
              <button className="close-btn" onClick={() => setShowCompleted(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {completedTasks.length === 0 ? (
                <div className="empty-state">
                  <p>Aucune tâche complétée</p>
                </div>
              ) : (
                <>
                  {currentCompletedTasks.map(task => (
                    <div key={task.id} className="completed-task">
                      <div className="completed-task-content">
                        <div className="completed-task-text">{task.text}</div>
                        <div className="completed-task-date">
                          ✓ Complétée {formatCompletedDate(task.updated_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {completedTotalPages > 1 && (
                    <div className="modal-pagination">
                      <Pagination
                        currentPage={completedPage}
                        totalPages={completedTotalPages}
                        onPageChange={setCompletedPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

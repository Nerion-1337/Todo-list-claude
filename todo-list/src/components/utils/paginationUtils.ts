/**
 * Calcule le nombre optimal de tâches à afficher par page
 * en fonction de la hauteur de l'écran de l'utilisateur
 * @returns Nombre de tâches par page (entre 3 et 15)
 */
export const calculateTasksPerPage = (): number => {
  const screenHeight = window.innerHeight; // Hauteur totale de l'écran
  const headerHeight = 150; // Header avec titre + boutons
  const paginationHeight = 80; // Pagination en bas
  const taskHeight = 90; // Une tâche complète (avec margin)
  const padding = 60; // Padding vertical de la liste

  // Calculer l'espace disponible pour les tâches
  const availableHeight =
    screenHeight - headerHeight - paginationHeight - padding;
  const calculatedTasks = Math.floor(availableHeight / taskHeight);

  // Limiter entre 3 (minimum) et 15 (maximum) tâches
  const finalTasksPerPage = Math.max(3, Math.min(15, calculatedTasks));

  // Log pour déboguer
  console.log("📊 Calcul pagination:", {
    screenHeight,
    availableHeight,
    calculatedTasks,
    finalTasksPerPage,
  });

  return finalTasksPerPage;
};

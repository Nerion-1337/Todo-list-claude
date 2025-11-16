/**
 * Calcule le temps restant jusqu'à une deadline avec détails complets
 * @param deadline - Date limite au format string ISO
 * @returns Objet contenant le texte à afficher et si la deadline est expirée
 */
export const getRemainingTime = (
  deadline: string | null
): { display: string; isExpired: boolean } => {
  if (!deadline) return { display: "", isExpired: false };

  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return { display: "Échue", isExpired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0)
    return {
      display: `${days}j ${hours}h ${minutes}m ${seconds}s`,
      isExpired: false,
    };
  if (hours > 0)
    return { display: `${hours}h ${minutes}m ${seconds}s`, isExpired: false };
  if (minutes > 0)
    return { display: `${minutes}m ${seconds}s`, isExpired: false };
  return { display: `${seconds}s`, isExpired: false };
};

/**
 * Formate une date de complétion en format relatif lisible
 * @param dateString - Date au format string ISO
 * @returns Texte formaté (ex: "Il y a 2 heures")
 */
export const formatCompletedDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return "À l'instant";
  }
};

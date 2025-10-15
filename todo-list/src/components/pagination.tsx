// components/Pagination.tsx
import React, { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [inputPage, setInputPage] = useState<string>(currentPage.toString());

  // Synchroniser l'input avec la page actuelle
  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePrevious = (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Accepter seulement les nombres
    if (value === '' || /^\d+$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleInputBlur = (): void => {
    const pageNumber = parseInt(inputPage, 10);
    
    if (isNaN(pageNumber) || pageNumber < 1) {
      setInputPage(currentPage.toString());
    } else if (pageNumber > totalPages) {
      setInputPage(totalPages.toString());
      onPageChange(totalPages);
    } else if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  // Ne rien afficher si pas de pages
  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className="pagination-container">

      {/* Bouton Précédent */}
      <button
        className="pagination-btn"
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        title="Page précédente"
      >
        ←
      </button>

      {/* Input page actuelle */}
      <div className="pagination-input-wrapper">
        <input
          type="text"
          className="pagination-input"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleInputKeyPress}
          title="Page actuelle"
        />
      </div>

      {/* Séparateur */}
      <div className="pagination-divider" />

      {/* Nombre total de pages */}
      <div className="pagination-total">{totalPages}</div>

      {/* Bouton Suivant */}
      <button
        className="pagination-btn"
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        title="Page suivante"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;
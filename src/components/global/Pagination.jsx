import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  // Génère un tableau d'entiers de 1 à totalPages
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Bouton Précédent */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${currentPage === 1
            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Liste des Pages */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange && onPageChange(page)}
          className={`flex h-10 w-10 items-center justify-center rounded-full font-medium transition-colors ${currentPage === page
              ? "bg-[#E8524D] text-white shadow-lg shadow-red-200" // Page active
              : "bg-transparent text-gray-500 hover:bg-gray-100"   // Pages inactives
            }`}
        >
          {page}
        </button>
      ))}

      {/* Affichage condensé si trop de pages (Optionnel) */}
      {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}

      {/* Bouton Suivant */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${currentPage === totalPages
            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
            : "bg-[#E8524D] text-white hover:bg-[#d44641] shadow-lg shadow-red-100"
          }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
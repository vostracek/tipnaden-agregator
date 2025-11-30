'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 2; // How many pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      // Always show first page, last page, current page, and pages around current
      const showPage =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - showPages && i <= currentPage + showPages);

      if (showPage) {
        pages.push(i);
      } else if (
        i === currentPage - showPages - 1 ||
        i === currentPage + showPages + 1
      ) {
        // Add ellipsis
        if (!pages.includes('...')) {
          pages.push('...');
        }
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-12 mb-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-5 py-3 rounded-lg font-semibold transition-all ${
          currentPage === 1
            ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 hover:border-slate-600 hover:scale-105'
        }`}
      >
        ← Předchozí
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-500 text-xl font-bold">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[44px] h-11 px-4 rounded-lg font-bold transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl scale-110 border-2 border-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 hover:border-slate-600 hover:scale-105'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-5 py-3 rounded-lg font-semibold transition-all ${
          currentPage === totalPages
            ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 hover:border-slate-600 hover:scale-105'
        }`}
      >
        Další →
      </button>
    </div>
  );
}
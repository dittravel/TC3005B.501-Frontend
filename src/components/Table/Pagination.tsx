/**
 * Reusable pagination for list of lists
 */

import { useState, useEffect } from "react";

interface PaginationProps {
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  maxVisible?: number;
}

/**
 * Pagination component that provides navigation controls for paginated data.
 * It displays a set of page numbers and allows users to navigate between them.
 * The component also includes controls to jump to the previous or next block of pages.
 * @param totalPages - The total number of pages available.
 * @param page - The current active page number.
 * @param setPage - A function to update the current page number.
 * @param maxVisible - The maximum number of page buttons to display at once (default is 5).
 * @returns A JSX element representing the pagination controls.
 */
export default function Pagination({
  totalPages,
  page,
  setPage,
  maxVisible = 5,
}: PaginationProps) {
  const [blockStart, setBlockStart] = useState(1);

  useEffect(() => {
    const newBlockStart = Math.floor((page - 1) / maxVisible) * maxVisible + 1;
    if (newBlockStart !== blockStart) setBlockStart(newBlockStart);
  }, [page, blockStart, maxVisible]);

  const handlePrevBlock = () => {
    const newStart = blockStart - maxVisible;
    if (newStart >= 1) {
      setBlockStart(newStart);
      setPage(newStart);
    }
  };

  const handleNextBlock = () => {
    const newStart = blockStart + maxVisible;
    if (newStart <= totalPages) {
      setBlockStart(newStart);
      setPage(newStart);
    }
  };

  const pageNumbers = Array.from({ length: maxVisible }, (_, i) => blockStart + i)
    .filter((n) => n <= totalPages);

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={handlePrevBlock}
        disabled={blockStart === 1}
        className="px-3 py-1 rounded border border-neutral-500 text-primary-500 hover:bg-blue-100 disabled:opacity-50"
      >
        {"«"}
      </button>

      {pageNumbers.map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`px-4 py-2 rounded border border-neutral-500 transition min-w-12 ${
            page === n
              ? "bg-primary-500 text-white"
              : "bg-white text-primary-500 hover:bg-blue-100"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        onClick={handleNextBlock}
        disabled={blockStart + maxVisible > totalPages}
        className="px-3 py-1 rounded border border-neutral-500 text-primary-500 hover:bg-blue-100 disabled:opacity-50"
      >
        {"»"}
      </button>
    </div>
  );
}

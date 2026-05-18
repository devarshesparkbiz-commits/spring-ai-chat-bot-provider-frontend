import React from 'react';
import Button from './Button';

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pageNumber, totalPages, onPageChange }) => (
  <div className="pagination">
    <Button
      variant="secondary"
      size="sm"
      disabled={pageNumber === 0}
      onClick={() => onPageChange(pageNumber - 1)}
    >
      ← Prev
    </Button>
    <span className="pagination-info">
      Page {pageNumber + 1} of {Math.max(totalPages, 1)}
    </span>
    <Button
      variant="secondary"
      size="sm"
      disabled={pageNumber + 1 >= totalPages}
      onClick={() => onPageChange(pageNumber + 1)}
    >
      Next →
    </Button>
  </div>
);

export default Pagination;

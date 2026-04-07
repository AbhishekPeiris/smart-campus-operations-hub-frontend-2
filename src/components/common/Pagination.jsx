import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <span className="text-xs text-text-muted">Page {currentPage + 1} of {totalPages}</span>
      <div className="flex gap-1">
        <Button variant="secondary" size="sm" disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={14} />
        </Button>
        <Button variant="secondary" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

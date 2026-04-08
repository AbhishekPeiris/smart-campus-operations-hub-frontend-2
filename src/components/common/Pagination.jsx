import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border flex-wrap">
      <span className="rounded-[14px] border border-border bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
        Page {currentPage + 1} of {totalPages}
      </span>
      <div className="flex gap-2">
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

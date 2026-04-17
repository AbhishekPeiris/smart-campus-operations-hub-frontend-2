import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <span className="rounded-[16px] border border-border bg-white/82 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted shadow-[0_10px_24px_rgba(31,65,114,0.06)]">
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

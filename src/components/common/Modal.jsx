import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-[6px]" onClick={onClose} />
      <div className={`relative surface-panel w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="page-kicker">Details</p>
            <h3 className="mt-1 text-lg font-semibold text-text-primary">{title}</h3>
          </div>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-border bg-white/90 text-text-muted transition-colors hover:border-primary-200 hover:bg-white hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

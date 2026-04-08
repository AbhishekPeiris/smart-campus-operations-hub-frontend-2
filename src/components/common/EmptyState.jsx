import { Inbox } from 'lucide-react';
export default function EmptyState({ message = 'No data found', icon }) {
  const ResolvedIcon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
      <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[22px] border border-border bg-white/92 shadow-[0_18px_32px_rgba(15,23,42,0.06)]">
        <ResolvedIcon size={34} strokeWidth={1.5} />
      </div>
      <p className="mt-5 text-sm font-semibold text-text-primary">{message}</p>
      <p className="mt-2 max-w-sm text-xs leading-5 text-text-muted">This space will populate automatically as soon as new activity is available in the system.</p>
    </div>
  );
}

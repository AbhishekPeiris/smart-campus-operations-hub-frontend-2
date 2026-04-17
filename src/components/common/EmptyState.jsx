import { Inbox } from 'lucide-react';
export default function EmptyState({ message = 'No data found', icon }) {
  const ResolvedIcon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
      <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[20px] border border-border bg-linear-to-br from-white to-surface-alt shadow-[0_14px_28px_rgba(31,65,114,0.10)]">
        <ResolvedIcon size={34} strokeWidth={1.5} />
      </div>
      <p className="mt-5 text-sm font-semibold text-text-primary">{message}</p>
      <p className="mt-2 max-w-md text-xs leading-6 text-text-muted">This section will update when new data is available.</p>
    </div>
  );
}

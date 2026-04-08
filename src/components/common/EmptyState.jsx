import { Inbox } from 'lucide-react';
export default function EmptyState({ message = 'No data found', icon }) {
  const ResolvedIcon = icon || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
      <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-white">
        <ResolvedIcon size={34} strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-sm font-medium">{message}</p>
      <p className="mt-1 text-xs text-text-muted">This section will update when new data is available.</p>
    </div>
  );
}

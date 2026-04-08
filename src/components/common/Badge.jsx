export default function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-[12px] border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}>
      {children}
    </span>
  );
}

export default function Badge({ className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-none border border-transparent px-2 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

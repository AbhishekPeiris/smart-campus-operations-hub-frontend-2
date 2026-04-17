export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {label}
        </label>
      )}
      <textarea className={`w-full px-4 py-3 text-sm resize-none ${error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border'}`} rows={4} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

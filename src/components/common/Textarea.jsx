export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="block text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {label}
        </label>
      )}
      <textarea className={`w-full resize-none px-4 py-3 text-sm text-text-primary shadow-[0_10px_20px_rgba(15,23,42,0.04)] ${error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border'}`} rows={4} {...props} />
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

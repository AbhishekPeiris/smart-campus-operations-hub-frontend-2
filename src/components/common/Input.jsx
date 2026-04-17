export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 text-sm ${error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

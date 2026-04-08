export default function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="block text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {label}
        </label>
      )}
      <select className={`w-full px-4 py-3 text-sm text-text-primary shadow-[0_10px_20px_rgba(15,23,42,0.04)] ${error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border'}`} {...props}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

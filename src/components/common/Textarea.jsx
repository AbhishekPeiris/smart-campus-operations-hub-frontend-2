export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea className={`w-full px-3 py-2 text-sm resize-none ${error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border'}`} rows={4} {...props} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

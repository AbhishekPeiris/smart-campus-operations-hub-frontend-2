export default function Spinner({ className = '' }) {
  return <div className={`animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 h-5 w-5 ${className}`} />;
}

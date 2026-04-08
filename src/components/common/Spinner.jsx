export default function Spinner({ className = '' }) {
  return <div className={`animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600 shadow-[0_0_0_4px_rgba(215,233,255,0.45)] h-5 w-5 ${className}`} />;
}

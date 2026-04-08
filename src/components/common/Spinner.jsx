export default function Spinner({ className = '' }) {
  return <div className={`h-5 w-5 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900 shadow-[0_0_0_5px_rgba(255,255,255,0.85)] ${className}`} />;
}

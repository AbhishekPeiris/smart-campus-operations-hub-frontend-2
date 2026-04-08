export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[16px] border font-semibold tracking-[0.01em] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
  const variants = {
    primary: 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_30px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 hover:bg-slate-900',
    secondary: 'border-border bg-white/92 text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white',
    danger: 'border-red-200 bg-red-50 text-danger shadow-[0_10px_24px_rgba(209,72,95,0.08)] hover:-translate-y-0.5 hover:bg-red-100',
    ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-white/75 hover:text-text-primary',
    success: 'border-emerald-700 bg-success text-white shadow-[0_16px_28px_rgba(22,129,94,0.18)] hover:-translate-y-0.5 hover:bg-emerald-700',
  };
  const sizes = {
    sm: 'min-h-9 px-3.5 py-2 text-xs',
    md: 'min-h-11 px-[1.125rem] py-2.5 text-sm',
    lg: 'min-h-12 px-[1.375rem] py-3 text-base',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

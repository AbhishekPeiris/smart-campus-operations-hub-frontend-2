export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[16px] border font-semibold tracking-[0.01em] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';
  const variants = {
    primary: 'border-primary-600 bg-linear-to-r from-primary-500 to-primary-600 text-white shadow-[0_14px_28px_rgba(42,127,255,0.24)] hover:-translate-y-0.5 hover:from-primary-600 hover:to-primary-700 hover:shadow-[0_18px_34px_rgba(42,127,255,0.28)]',
    secondary: 'border-border bg-white/88 text-text-primary shadow-[0_10px_24px_rgba(31,65,114,0.08)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(31,65,114,0.12)]',
    danger: 'border-red-200 bg-white text-danger shadow-[0_10px_24px_rgba(202,66,92,0.08)] hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-[0_14px_28px_rgba(202,66,92,0.14)]',
    ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-white/75 hover:text-text-primary',
    success: 'border-emerald-700 bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_14px_28px_rgba(28,139,104,0.22)] hover:-translate-y-0.5 hover:from-emerald-600 hover:to-emerald-700',
  };
  const sizes = {
    sm: 'min-h-9 px-3.5 py-2 text-xs',
    md: 'min-h-[42px] px-[1.125rem] py-2.5 text-sm',
    lg: 'min-h-11 px-[1.375rem] py-3 text-base',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

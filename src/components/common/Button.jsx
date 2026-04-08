export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[16px] border font-semibold tracking-[0.01em] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_1px_2px_rgba(16,36,62,0.05)] active:translate-y-px';
  const variants = {
    primary: 'border-primary-700 bg-primary-600 text-white hover:border-primary-800 hover:bg-primary-700',
    secondary: 'border-border-strong bg-white/95 text-text-primary hover:bg-primary-50 hover:border-primary-200',
    danger: 'border-red-700 bg-danger text-white hover:bg-red-700 hover:border-red-800',
    ghost: 'border-transparent bg-transparent text-text-secondary shadow-none hover:border-border hover:bg-white/70 hover:text-text-primary',
    success: 'border-emerald-700 bg-success text-white hover:bg-emerald-700 hover:border-emerald-800',
  };
  const sizes = {
    sm: 'min-h-10 px-3.5 py-2 text-xs',
    md: 'min-h-11 px-4.5 py-2.5 text-sm',
    lg: 'min-h-12 px-5.5 py-3 text-base',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

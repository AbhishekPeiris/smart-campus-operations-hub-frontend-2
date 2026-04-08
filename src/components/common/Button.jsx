export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-none border font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'border-primary-700 bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'border-border bg-white text-text-primary hover:bg-surface-alt',
    danger: 'border-red-700 bg-danger text-white hover:bg-red-700',
    ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary',
    success: 'border-emerald-700 bg-success text-white hover:bg-emerald-700',
  };
  const sizes = {
    sm: 'min-h-8 px-3 py-1.5 text-xs',
    md: 'min-h-9 px-4 py-2 text-sm',
    lg: 'min-h-10 px-5 py-2.5 text-base',
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
}

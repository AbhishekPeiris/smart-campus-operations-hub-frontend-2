export default function Card({ children, className = '', ...props }) {
  return <div className={`surface-panel transition-transform duration-200 hover:-translate-y-[1px] ${className}`} {...props}>{children}</div>;
}

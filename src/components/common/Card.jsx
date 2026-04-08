export default function Card({ children, className = '', ...props }) {
  return <div className={`surface-panel ${className}`} {...props}>{children}</div>;
}

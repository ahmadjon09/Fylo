const variants = {
  default: "bg-secondary text-secondary-foreground border border-border",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
  outline: "bg-transparent border border-border text-muted-foreground",
};

export const Badge = ({ variant='default', className='', children, ...props }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-[600] tracking-[0.02em] uppercase ${variants[variant]||variants.default} ${className}`} {...props}>
    {children}
  </span>
);

export default Badge;

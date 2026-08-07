import { motion } from 'framer-motion';

export const Card = ({ children, className='', hover=false, padding=true, ...props }) => (
  <motion.div
    initial={{ opacity:0, y:8 }}
    animate={{ opacity:1, y:0 }}
    transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
    className={`
      rounded-[16px] border border-border bg-card text-card-foreground
      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.06)]
      ${hover ? 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.08)] hover:-translate-y-[1px] transition-all duration-200' : ''}
      ${padding ? 'p-5' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </motion.div>
);

export const StatCard = ({ title, value, subtitle, icon, trend, color='hsl(var(--foreground))', loading=false }) => {
  if (loading) return <div className="rounded-[16px] border border-border bg-card p-5 animate-pulse"><div className="h-4 w-24 bg-muted rounded mb-3" /><div className="h-7 w-32 bg-muted rounded mb-2" /><div className="h-3 w-40 bg-muted rounded" /></div>;
  return (
    <Card className="relative overflow-hidden group" hover>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        <div className="w-full h-full rounded-full blur-2xl" style={{ background: color }} />
      </div>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">{title}</p>
          <p className="text-[26px] font-[700] tracking-[-0.02em] leading-none tabular-nums">{value}</p>
          {subtitle && <p className="text-[12px] font-[450] text-muted-foreground/80">{subtitle}</p>}
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-1 text-[12px] font-[600] mt-1.5 px-2 py-0.5 rounded-full ${trend>=0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600'}`}>
              {trend>=0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-[12px] border border-border bg-secondary flex items-center justify-center text-foreground/80 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Card, StatCard } from '../../components/ui/Card';
import { ChartSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { FiPackage, FiAlertTriangle, FiXCircle, FiDollarSign, FiTrendingUp, FiUsers, FiShoppingBag, FiActivity, FiGlobe, FiTruck, FiFileText } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getSocket } from '../../lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const formatMoney = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const formatCompact = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString() || 0}`;
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value || 0);
  useEffect(() => {
    let start = display;
    let end = value || 0;
    if (start === end) return;
    let startTime = null;
    const duration = 800;
    const animate = (t) => {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span className="tabular-nums">{formatMoney(display)}</span>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data.data,
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleUpdate = () => qc.invalidateQueries({ queryKey: ['dashboard'] });
    socket.on('dashboard:update', handleUpdate);
    return () => socket.off('dashboard:update', handleUpdate);
  }, [qc]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  const k = data?.kpis || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[750] tracking-[-0.03em] leading-none">{t('dashboard.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Realtime workspace • Auto-updates via Socket.IO</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-[600] text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.totalProducts')} value={k.totalProducts || 0} subtitle={`${k.totalQuantity || 0} ${t('dashboard.units')}`} icon={<FiPackage className="h-5 w-5" />} />
        <StatCard title={t('dashboard.inventoryValue')} value={<AnimatedNumber value={k.inventoryValue} />} subtitle={t('dashboard.value')} icon={<FiDollarSign className="h-5 w-5" />} />
        <StatCard title={t('dashboard.realizedProfit')} value={<AnimatedNumber value={k.realizedProfit} />} subtitle={t('dashboard.profitOnlySold')} icon={<FiTrendingUp className="h-5 w-5" />} />
        <StatCard title={t('dashboard.realizedRevenue')} value={<AnimatedNumber value={k.realizedRevenue} />} subtitle={`${k.totalSalesCount || 0} ${t('dashboard.salesCount')}`} icon={<FiShoppingBag className="h-5 w-5" />} />
        <StatCard title={t('dashboard.expectedProfit')} value={formatCompact(k.expectedProfit)} subtitle={t('dashboard.ifAllSold')} icon={<FiTrendingUp className="h-5 w-5" />} />
        <StatCard title="Жами халқаро йўл" value={formatCompact(k.totalIntlShipping || 0)} subtitle="Чет элдан Ўзбекистонга" icon={<FiGlobe className="h-5 w-5" />} />
        <StatCard title="Жами ички йўл" value={formatCompact(k.totalLocalShipping || 0)} subtitle="Ички логистика" icon={<FiTruck className="h-5 w-5" />} />
        <StatCard title="Умумий йўл харажатлари" value={formatCompact(k.totalShipping || 0)} subtitle={`Харид: ${formatCompact(k.totalPurchase || 0)}`} icon={<FiFileText className="h-5 w-5" />} />
        <StatCard title={t('dashboard.lowStock')} value={k.lowStockProducts || 0} icon={<FiAlertTriangle className="h-5 w-5" />} />
        <StatCard title={t('dashboard.outOfStock')} value={k.outOfStockProducts || 0} icon={<FiXCircle className="h-5 w-5" />} />
        <StatCard title={t('dashboard.onlineUsers')} value={`${k.onlineUsers || 0} / ${k.totalUsers || 0}`} subtitle={t('dashboard.totalUsers')} icon={<FiUsers className="h-5 w-5" />} />
        <StatCard title="Ўртача таннарх" value={formatCompact(k.avgUnitCost || 0)} subtitle="Барча маҳсулотлар" icon={<FiDollarSign className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-[650] tracking-[-0.01em]">{t('dashboard.dailySales')}</h3>
            <span className="text-[11px] font-[500] text-muted-foreground flex items-center gap-1.5"><FiActivity className="h-3 w-3" />Last 30d</span>
          </div>
          <div className="h-[280px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.dailySales || []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.15} /><stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="_id" fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" fill="url(#rev)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#prof)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-[13px] font-[650] tracking-[-0.01em] mb-5">{t('dashboard.monthlySales')}</h3>
          <div className="h-[280px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="_id" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[13px] font-[650] tracking-[-0.01em] mb-4">{t('dashboard.topProducts')}</h3>
          <div className="space-y-2.5">
            {(data?.charts?.topProducts || []).slice(0, 6).map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="group flex items-center justify-between rounded-[12px] border border-border/60 bg-muted/30 hover:bg-accent/60 p-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-foreground text-background text-[11px] font-[700]">{i + 1}</span>
                  <span className="truncate text-[13px] font-[550] tracking-[-0.01em]">{p.product?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-muted-foreground tabular-nums">{p.totalQty} {t('dashboard.units')}</span>
                  <span className="font-[650] tabular-nums text-emerald-600 dark:text-emerald-400">${p.totalProfit?.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="flex-1">
            <h3 className="text-[13px] font-[650] tracking-[-0.01em] mb-4">{t('dashboard.recentSales')}</h3>
            <div className="space-y-0 divide-y divide-border/60 -mx-5">
              {(data?.recentSales || []).slice(0, 5).map(s => (
                <div key={s._id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0"><div className="truncate text-[13px] font-[550]">{s.product?.name}</div><div className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()} • {s.soldBy?.fullName}</div></div>
                  <div className="text-right"><div className="text-[13px] font-[650] tabular-nums">+${s.profit?.toLocaleString()}</div><div className="text-[11px] text-muted-foreground">{s.quantity} {t('dashboard.units')}</div></div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-[13px] font-[650] tracking-[-0.01em] mb-3">{t('dashboard.lowStockAlert')}</h3>
            <div className="space-y-2">
              {(data?.lowStockList || []).length ? (data?.lowStockList || []).map(p => (
                <div key={p._id} className="flex items-center justify-between rounded-[10px] border-l-[3px] border-amber-500 bg-amber-500/5 px-3 py-2.5">
                  <span className="text-[13px] font-[550] truncate">{p.name}</span><span className="text-[11px] font-[650] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">{p.currentQuantity} left</span>
                </div>
              )) : <p className="text-[13px] text-muted-foreground">{t('dashboard.noLowStock')}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
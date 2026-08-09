import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Card } from '../../components/ui/Card';
import { FiServer, FiDatabase, FiCpu, FiHardDrive, FiZap, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function SystemPanel() {
  const { data, isLoading, refetch } = useQuery({
    queryKey:['system-stats'],
    queryFn: async()=> (await api.get('/system/stats')).data.data,
    refetchInterval: 10000,
  });

  const handleFlush = async()=>{
    if(!confirm('Redis тозалансинми? Кэш ўчади!')) return;
    try { await api.post('/system/flush-redis'); toast.success('Redis тозаланди'); refetch(); } catch(e){ toast.error('Хатолик'); }
  };

  if(isLoading) return <div className="max-w-[1280px] mx-auto space-y-4"><div className="h-32 bg-muted rounded-[14px] animate-pulse" /><div className="h-32 bg-muted rounded-[14px] animate-pulse" /></div>;

  const redis = data?.redis || {};
  const mongo = data?.mongo || {};
  const sys = data?.system || {};
  const fylo = data?.fylo || {};

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center"><FiServer className="h-5 w-5" /></div><div><h1 className="text-[22px] font-[750] tracking-[-0.03em] leading-none">Тизим — Fylo Super Admin</h1><p className="text-[12px] text-muted-foreground mt-1">Redis, MongoDB, CPU, Memory • @FyloRobot</p></div></div>
        <Button variant="outline" size="sm" leftIcon={<FiTrash2 className="h-4 w-4" />} onClick={handleFlush}>Redis тозалаш</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><div className="flex items-center gap-2.5 mb-2"><FiZap className="h-4 w-4 text-amber-500" /><span className="text-[11px] font-[650] uppercase tracking-[0.06em] text-muted-foreground">Redis</span></div><div className="text-[18px] font-[700]">{redis.used || 'N/A'}</div><div className="text-[11px] text-muted-foreground mt-1">Peak: {redis.peak || 'N/A'} • Bytes: {(redis.usedBytes||0).toLocaleString()}</div></Card>
        <Card><div className="flex items-center gap-2.5 mb-2"><FiDatabase className="h-4 w-4 text-blue-500" /><span className="text-[11px] font-[650] uppercase text-muted-foreground">MongoDB</span></div><div className="text-[18px] font-[700]">{mongo.objects || 0} docs</div><div className="text-[11px] text-muted-foreground mt-1">Data: {(mongo.dataSize||0/1024/1024).toFixed?.(2) || (mongo.dataSize/1024/1024).toFixed(2)} MB • Index: {(mongo.indexSize||0/1024/1024).toFixed?.(2) || (mongo.indexSize/1024/1024).toFixed(2)} MB</div></Card>
        <Card><div className="flex items-center gap-2.5 mb-2"><FiCpu className="h-4 w-4 text-emerald-500" /><span className="text-[11px] font-[650] uppercase tracking-[0.06em] text-muted-foreground">CPU / Uptime</span></div><div className="text-[18px] font-[700]">{sys.uptimeHuman || '0h'}</div><div className="text-[11px] text-muted-foreground mt-1">{sys.os?.cpus || 0} cores • Load: {sys.os?.loadAvg?.[0]?.toFixed(2) || 0}</div></Card>
        <Card><div className="flex items-center gap-2.5 mb-2"><FiHardDrive className="h-4 w-4 text-purple-500" /><span className="text-[11px] font-[650] uppercase tracking-[0.06em] text-muted-foreground">Memory</span></div><div className="text-[18px] font-[700]">{((sys.memory?.heapUsed||0)/1024/1024).toFixed(1)} MB</div><div className="text-[11px] text-muted-foreground mt-1">Total: {(sys.os?.totalMem/1024/1024/1024).toFixed(1)} GB • Free: {(sys.os?.freeMem/1024/1024/1024).toFixed(1)} GB</div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[13px] font-[650] mb-3">Fylo App Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="rounded-[10px] bg-muted/50 border border-border p-3"><div className="text-muted-foreground text-[11px] uppercase font-[650]">Маҳсулотлар</div><div className="text-[18px] font-[700]">{fylo.products||0}</div></div>
            <div className="rounded-[10px] bg-muted/50 border border-border p-3"><div className="text-muted-foreground text-[11px] uppercase font-[650]">Сотувлар</div><div className="text-[18px] font-[700]">{fylo.sales||0}</div></div>
            <div className="rounded-[10px] bg-muted/50 border border-border p-3"><div className="text-muted-foreground text-[11px] uppercase font-[650]">Фойдаланувчилар</div><div className="text-[18px] font-[700]">{fylo.users||0}</div></div>
            <div className="rounded-[10px] bg-muted/50 border border-border p-3"><div className="text-muted-foreground text-[11px] uppercase font-[650]">Аудитлар</div><div className="text-[18px] font-[700]">{fylo.audits||0}</div></div>
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground">Лойиҳа: {fylo.project} • Бот: {fylo.bot} • Версия: {fylo.version} • Node: {sys.nodeVersion}</div>
        </Card>

        <Card>
          <h3 className="text-[13px] font-[650] mb-3">Очиқ Коллекциялар</h3>
          <div className="flex flex-wrap gap-1.5">
            {(mongo.collectionList||[]).map(c=><span key={c} className="px-2.5 py-1 rounded-full bg-secondary border border-border text-[11px] font-[500]">{c}</span>)}
          </div>
          <div className="mt-4 space-y-2 text-[12px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Платформа</span><span className="font-[600]">{sys.os?.platform} {sys.os?.arch}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Хост</span><span className="font-[600]">{sys.os?.hostname}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Env</span><span className="font-[600]">{sys.env}</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-[13px] font-[650] mb-3">Аудит — Жойлашув Хритаси (OpenMap)</h3>
        <div className="h-[320px] rounded-[12px] overflow-hidden border border-border bg-muted relative">
          <iframe
            title="Fylo Map"
            width="100%"
            height="100%"
            style={{ border:0 }}
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=69.1%2C41.2%2C69.4%2C41.4&layer=mapnik&marker=41.3111%2C69.2797"
          />
          <div className="absolute bottom-2 left-2 rounded-[8px] bg-card border border-border px-2.5 py-1 text-[11px] shadow">📍 Тошкент • Fylo • OpenStreetMap</div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Фойдаланувчилар жойлашуви агар рухсат берса аудит логларда сақланади, супер админ картада кўра олади.</p>
      </Card>
    </div>
  );
}

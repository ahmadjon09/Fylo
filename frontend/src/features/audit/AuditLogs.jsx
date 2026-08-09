import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { PremiumTable } from '../../components/ui/Table';
import { FiShield, FiMapPin, FiUser } from 'react-icons/fi';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const { data, isLoading } = useQuery({
    queryKey:['audit', page, search, action],
    queryFn: async()=> (await api.get('/audit', { params:{ page, limit:20, search: search||undefined, action: action||undefined } })).data,
    placeholderData:(p)=>p,
    staleTime: 1000*30,
  });

  const columns = [
    { key:'createdAt', title:'Вақт', render:(_,row)=> {
      try { return <span className="text-[11px] font-mono">{row?.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}</span>; } catch { return <span>-</span>; }
    }},
    { key:'actionUz', title:'Ҳаракат', render:(v,row)=> <span className="text-[12px] font-[600]">{row?.actionUz || row?.action || '-'}</span> },
    { key:'userName', title:'Фойдаланувчи', render:(v,row)=> <span className="flex items-center gap-1.5 text-[12px]"><FiUser className="h-3 w-3" />{row?.userName || 'Noma\'lum'} <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted border">{row?.userRole || '-'}</span></span> },
    { key:'details', title:'Тафсилот', render:(v,row)=> {
      const details = row?.details;
      if (!details) return <span className="text-[11px] text-muted-foreground">-</span>;
      const name = details?.name || details?.fullName || details?.phone || '';
      if (name) return <span className="text-[11px] max-w-[200px] truncate inline-block">{String(name).slice(0,60)}</span>;
      try {
        const str = JSON.stringify(details);
        return <span className="text-[11px] max-w-[200px] truncate inline-block">{str ? str.slice(0,60) : '-'}</span>;
      } catch {
        return <span className="text-[11px]">-</span>;
      }
    }},
    { key:'ip', title:'IP', render:(v)=> <span className="font-mono text-[11px]">{v || '-'}</span> },
    { key:'location', title:'Жой', render:(v,row)=> row?.location?.lat ? <span className="flex items-center gap-1 text-[11px]"><FiMapPin className="h-3 w-3" />{Number(row.location.lat).toFixed(3)}, {Number(row.location.lon).toFixed(3)}</span> : '-' },
  ];

  return (
    <div className="space-y-5 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center"><FiShield className="h-5 w-5" /></div>
        <div><h1 className="text-[22px] font-[750] tracking-[-0.03em] leading-none">Аудит Логлар • Fylo</h1><p className="text-[12px] text-muted-foreground mt-1">2 ой сақланади, кейин авто ўчирилади • Фақат супер админ</p></div>
      </div>

      <div className="rounded-[12px] border border-border bg-card p-3 flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Қидириш..." className="h-9 flex-1 rounded-[10px] border border-border bg-background px-3 text-[13px] outline-none focus:ring-4 focus:ring-foreground/10" />
        <select value={action} onChange={e=>setAction(e.target.value)} className="h-9 rounded-[10px] border border-border bg-background px-3 text-[13px]">
          <option value="">Барча ҳаракатлар</option>
          <option value="user:login">Кириш</option>
          <option value="product:create">Маҳсулот яратиш</option>
          <option value="sale:create">Сотув</option>
          <option value="user:create">Фойдаланувчи яратиш</option>
        </select>
      </div>

      <PremiumTable columns={columns} data={data?.logs||[]} loading={isLoading} storageKey="audit" pagination={{ page: data?.page||1, pages: data?.pages||1, total: data?.total||0, hasNext: (data?.page||1) < (data?.pages||1) }} onPageChange={setPage} />
    </div>
  );
}

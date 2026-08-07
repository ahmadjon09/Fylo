import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PremiumTable } from '../../components/ui/Table';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getSocket } from '../../lib/socket';
import { FiPlus, FiDownload, FiPrinter, FiShoppingCart } from 'react-icons/fi';

export default function SalesList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey:['sales', page],
    queryFn: async()=> (await api.get('/sales', { params:{ page, limit:20, sortBy:'createdAt', sortOrder:'desc' } })).data,
    placeholderData:(prev)=>prev,
    staleTime: 1000*60*1,
    gcTime: 1000*60*10,
  });

  useEffect(()=>{
    const s = getSocket();
    if (!s) return;
    const ref = ()=> qc.invalidateQueries({ queryKey:['sales'] });
    s.on('sale:created', ref); s.on('sale:refunded', ref);
    return ()=>{ s.off('sale:created', ref); s.off('sale:refunded', ref); };
  },[qc]);

  const refundMut = useMutation({
    mutationFn: async(id)=> await api.post(`/sales/${id}/refund`),
    onSuccess: ()=>{ toast.success(t('sale.refundSuccess')); qc.invalidateQueries({queryKey:['sales']}); },
    onError: (e)=> toast.error(e.response?.data?.message||t('toast.error')),
  });

  const handleExport = async()=>{
    try{ const res = await api.get('/export/sales', { responseType:'blob' }); const url = window.URL.createObjectURL(new Blob([res.data])); const a=document.createElement('a'); a.href=url; a.download='sales.xlsx'; a.click(); }catch{ toast.error(t('toast.error')); }
  };
  const handlePrint = ()=>{
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${t('sale.title')}</title><style>body{font-family:Inter;padding:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px} th{background:#f8fafc}</style></head><body><h2>${t('sale.title')} • ${new Date().toLocaleString()}</h2><table><thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Price</th><th>Revenue</th><th>Profit</th></tr></thead><tbody>${(data?.data||[]).map(s=>`<tr><td>${new Date(s.createdAt).toLocaleDateString()}</td><td>${s.product?.name||s.productSnapshot?.name}</td><td>${s.quantity}</td><td>$${s.sellingPrice}</td><td>$${s.totalRevenue?.toFixed(2)}</td><td>$${s.profit?.toFixed(2)}</td></tr>`).join('')}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  const columns = [
    { key:'createdAt', title:t('common.date'), sortable:true, render:(_,row)=> <span className="text-[12px] text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { key:'product', title:t('sale.product'), render:(_,row)=> <span className="font-[600] text-[13px]">{row.product?.name||row.productSnapshot?.name}</span> },
    { key:'quantity', title:t('sale.quantity'), render:(v)=> <span className="tabular-nums font-[600]">{v}</span> },
    { key:'unitCost', title:t('sale.unitCost'), render:(v,row)=> `$${row.unitCost?.toFixed(2)}` },
    { key:'sellingPrice', title:t('sale.sellingPrice'), render:(v)=> `$${v?.toFixed(2)}` },
    { key:'totalRevenue', title:t('sale.revenue'), render:(v)=> <span className="font-[650] tabular-nums">${v?.toFixed(2)}</span> },
    { key:'profit', title:t('sale.profit'), render:(v)=> <span className="font-[650] tabular-nums text-emerald-600 dark:text-emerald-400">+${v?.toFixed(2)}</span> },
    { key:'customer', title:t('sale.customer'), render:(_,row)=> row.customer?.name||'-' },
    { key:'soldBy', title:t('sale.soldBy'), render:(_,row)=> <span className="text-[12px]">{row.soldBy?.fullName}</span> },
    { key:'actions', title:t('common.actions'), render:(_,row)=> row.status!=='refunded' ? <Button size="sm" variant="outline" onClick={()=>{ if(confirm(t('sale.refundConfirm'))) refundMut.mutate(row._id); }}>{t('sale.refund')}</Button> : <Badge variant="outline">Refunded</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center shrink-0"><FiShoppingCart className="h-5 w-5" /></div>
          <div className="min-w-0"><h1 className="text-[22px] font-[750] tracking-[-0.03em] leading-none truncate">{t('sale.title')} <span className="text-muted-foreground font-[500]">• {data?.pagination?.total||0}</span></h1><p className="text-[12px] text-muted-foreground mt-1">{t('sale.totalSales')}</p></div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full">
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" leftIcon={<FiPrinter className="h-4 w-4" />} onClick={handlePrint}>{t('common.print')}</Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" leftIcon={<FiDownload className="h-4 w-4" />} onClick={handleExport}>{t('common.export')}</Button>
          <Button size="sm" className="w-full sm:w-auto justify-center col-span-2" leftIcon={<FiPlus className="h-4 w-4" />} onClick={()=>navigate('/sales/new')}>{t('sale.newSale')}</Button>
        </div>
      </div>

      <PremiumTable columns={columns} data={data?.data||[]} loading={isLoading} storageKey="sales" pagination={data?.pagination} onPageChange={setPage} />
    </div>
  );
}

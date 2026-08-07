import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchableSelect } from '../../components/ui/Select';
import { PremiumTable } from '../../components/ui/Table';
import toast from 'react-hot-toast';
import { getSocket } from '../../lib/socket';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiDownload, FiPrinter, FiBox, FiDollarSign } from 'react-icons/fi';

export default function ProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { data, isLoading } = useQuery({
    queryKey:['products', { search, status, page, sortBy, sortOrder }],
    queryFn: async()=>{
      const { data } = await api.get('/products', { params:{ search: search||undefined, status: status||undefined, page, limit:20, sortBy, sortOrder } });
      return data;
    },
    placeholderData: (prev)=> prev,
    staleTime: 1000*60*2,
    gcTime: 1000*60*10,
    keepPreviousData: true,
  });

  const deleteMut = useMutation({
    mutationFn: async(id)=> await api.delete(`/products/${id}`),
    onSuccess: ()=>{ toast.success(t('toast.deleted')); qc.invalidateQueries({queryKey:['products']}); },
    onError: (e)=> toast.error(e.response?.data?.message||t('toast.error')),
  });

  useEffect(()=>{
    const s = getSocket();
    if (!s) return;
    const refresh = ()=> qc.invalidateQueries({ queryKey:['products'] });
    s.on('product:created', refresh); s.on('product:updated', refresh); s.on('product:deleted', refresh);
    return ()=>{ s.off('product:created', refresh); s.off('product:updated', refresh); s.off('product:deleted', refresh); };
  }, [qc]);

  const handleExport = async()=>{
    try{ const res = await api.get('/export/products', { responseType:'blob' }); const url = window.URL.createObjectURL(new Blob([res.data])); const a=document.createElement('a'); a.href=url; a.download='products.xlsx'; a.click(); toast.success(t('toast.exportSuccess')); }catch{ toast.error(t('toast.error')); }
  };
  const handlePrint = ()=>{
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${t('product.title')} - Print</title><style>body{font-family:Inter,sans-serif;padding:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px;text-align:left} th{background:#f8fafc;font-weight:600}</style></head><body><h2>${t('product.title')} • ${new Date().toLocaleString()}</h2><table><thead><tr><th>${t('product.name')}</th><th>SKU</th><th>${t('product.currentQty')}</th><th>${t('product.unitCost')}</th><th>${t('product.status')}</th><th>${t('product.inventoryValue')}</th></tr></thead><tbody>${(data?.data||[]).map(p=>`<tr><td>${p.name}</td><td>${p.sku||''}</td><td>${p.currentQuantity}</td><td>$${p.unitCost}</td><td>${p.status}</td><td>$${(p.currentQuantity*p.unitCost).toFixed(2)}</td></tr>`).join('')}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

  const columns = [
    { key:'image', title:'', width:'56px', render:(_, row)=> <img src={row.images?.[0]?.url || `https://api.dicebear.com/7.x/shapes/svg?seed=${row.name}`} alt="" className="min-h-9 min-w-9 rounded-[10px] object-cover border border-border bg-muted" /> },
    { key:'name', title:t('product.name'), sortable:true, render:(v,row)=> <div><div className="font-[600] tracking-[-0.01em] text-[13.5px]">{row.name}</div><div className="text-[11px] text-muted-foreground font-mono">{row.sku||'NO-SKU'}</div></div> },
    { key:'currentQuantity', title:t('product.currentQty'), sortable:true, render:(v,row)=> <span className="font-[600] tabular-nums">{row.currentQuantity}<span className="text-muted-foreground font-[400] text-[11px]">/{row.quantity}</span></span> },
    { key:'unitCost', title:t('product.unitCost'), sortable:true, render:(v,row)=> <span className="tabular-nums">${row.unitCost?.toFixed(2)}</span> },
    { key:'minSellingPrice', title:t('product.minPrice'), render:(v,row)=> <span className="tabular-nums">${row.minSellingPrice?.toFixed(2)}</span> },
    { key:'status', title:t('product.status'), render:(v,row)=> <Badge variant={row.status==='in_stock'?'success':row.status==='low_stock'?'warning':'danger'}>{row.status.replace('_',' ')}</Badge> },
    { key:'inventoryValue', title:t('product.inventoryValue'), render:(v,row)=> <span className="font-[600] tabular-nums">${(row.currentQuantity*row.unitCost).toFixed(2)}</span> },
    { key:'actions', title:t('common.actions'), width:'100px', render:(_,row)=> (
      <div className="flex items-center gap-1">
        <button onClick={()=>navigate(`/products/edit/${row._id}`)} className="h-8 w-8 rounded-[8px] border border-border bg-background hover:bg-accent flex items-center justify-center"><FiEdit2 className="h-3.5 w-3.5" /></button>
        <button onClick={()=>{ if(confirm(t('user.deleteConfirm'))) deleteMut.mutate(row._id); }} className="h-8 w-8 rounded-[8px] border border-border bg-background hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 flex items-center justify-center"><FiTrash2 className="h-3.5 w-3.5" /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center"><FiBox className="h-5 w-5" /></div>
          <div><h1 className="text-[22px] font-[750] tracking-[-0.03em] leading-none">{t('product.title')} <span className="text-muted-foreground font-[500]">• {data?.pagination?.total||0}</span></h1><p className="text-[12px] text-muted-foreground mt-1">{t('product.searchPlaceholder')}</p></div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" onClick={handlePrint} leftIcon={<FiPrinter className="h-4 w-4" />}>{t('common.print')}</Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center" onClick={handleExport} leftIcon={<FiDownload className="h-4 w-4" />}>{t('common.export')}</Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center col-span-2 sm:col-span-1" onClick={()=>navigate('/products/bulk')}>{t('nav.bulk')}</Button>
          <Button size="sm" className="w-full sm:w-auto justify-center col-span-2 sm:col-span-1" leftIcon={<FiPlus className="h-4 w-4" />} onClick={()=>navigate('/products/new')}>{t('product.create')}</Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder={t('product.searchPlaceholder')} className="h-9 w-full rounded-[10px] border border-border bg-background pl-9 pr-3 text-[13px] outline-none focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.06]" />
        </div>
        <div className="flex gap-2">
          <div className="w-[160px]"><SearchableSelect options={[{label:t('common.all'),value:''},{label:'In Stock',value:'in_stock'},{label:'Low Stock',value:'low_stock'},{label:'Out',value:'out_of_stock'}]} value={status} onChange={v=>{ setStatus(v); setPage(1); }} placeholder={t('product.filterStatus')} /></div>
          <select value={`${sortBy}:${sortOrder}`} onChange={e=>{ const [sb,so]=e.target.value.split(':'); setSortBy(sb); setSortOrder(so); }} className="h-9 rounded-[10px] border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/20 focus:ring-4 focus:ring-foreground/[0.06]">
            <option value="createdAt:desc">{t('product.sortNewest')}</option><option value="createdAt:asc">{t('product.sortOldest')}</option><option value="name:asc">{t('product.sortName')}</option><option value="unitCost:desc">{t('product.sortCostHigh')}</option><option value="currentQuantity:asc">{t('product.sortQtyLow')}</option>
          </select>
        </div>
      </div>

      <PremiumTable
        columns={columns}
        data={data?.data||[]}
        loading={isLoading}
        searchable={false}
        storageKey="products"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(k)=>{ if(sortBy===k) setSortOrder(o=> o==='asc'?'desc':'asc'); else { setSortBy(k); setSortOrder('asc'); } }}
        pagination={data?.pagination}
        onPageChange={setPage}
      />
    </div>
  );
}

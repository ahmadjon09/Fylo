import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import { SearchableSelect } from '../../components/ui/Select';
import NumberInput from '../../components/ui/NumberInput';
import Input, { Textarea } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function SaleForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [comment, setComment] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: products } = useQuery({
    queryKey:['products-select'],
    queryFn: async()=> (await api.get('/products', { params:{ limit:100, sortBy:'name', sortOrder:'asc' } })).data.data,
    staleTime: 1000*60*5,
  });

  const selected = useMemo(()=> products?.find(p=>p._id===productId), [products, productId]);

  const metrics = useMemo(()=>{
    if (!selected) return { cost:0, revenue:0, profit:0 };
    const cost = selected.unitCost * Number(quantity||0);
    const revenue = Number(sellingPrice||0) * Number(quantity||0);
    return { cost, revenue, profit: revenue-cost };
  }, [selected, quantity, sellingPrice]);

  const mut = useMutation({
    mutationFn: async()=> {
      const payload = { productId, quantity: Number(quantity), sellingPrice: Number(sellingPrice), customerName, customerPhone, customerAddress, comment };
      return (await api.post('/sales', payload)).data;
    },
    onMutate: async()=>{
      // Optimistic: reduce product stock instantly
      if (selected) {
        qc.setQueriesData({ queryKey:['products'] }, (old)=>{
          if (!old) return old;
          return { ...old, data: (old.data||[]).map(p=> p._id===productId ? { ...p, currentQuantity: Math.max(0, p.currentQuantity - Number(quantity||0)) } : p) };
        });
        qc.setQueriesData({ queryKey:['products-select'] }, (old)=>{
          if (!old) return old;
          return old.map(p=> p._id===productId ? { ...p, currentQuantity: Math.max(0, p.currentQuantity - Number(quantity||0)) } : p);
        });
      }
      // Optimistic sale list
      const tempSale = {
        _id: `temp-${Date.now()}`,
        product: selected,
        quantity: Number(quantity),
        sellingPrice: Number(sellingPrice),
        totalRevenue: metrics.revenue,
        profit: metrics.profit,
        unitCost: selected?.unitCost||0,
        customer: { name: customerName },
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
      qc.setQueriesData({ queryKey:['sales'] }, (old)=>{
        if (!old) return old;
        return { ...old, data: [tempSale, ...(old.data||[])] };
      });
      return { tempId: tempSale._id };
    },
    onSuccess: (res, _vars, ctx)=>{
      toast.success(t('toast.created'));
      // Replace temp
      qc.setQueriesData({ queryKey:['sales'] }, (old)=>{
        if (!old) return old;
        return { ...old, data: (old.data||[]).map(s=> s._id===ctx?.tempId ? res.data : s) };
      });
      qc.invalidateQueries({queryKey:['dashboard']});
      qc.invalidateQueries({queryKey:['products']});
      navigate('/sales');
    },
    onError: (e, _vars, ctx)=>{
      toast.error(e.response?.data?.message||t('toast.error'));
      // Rollback
      qc.invalidateQueries({queryKey:['products']});
      qc.invalidateQueries({queryKey:['products-select']});
      qc.invalidateQueries({queryKey:['sales']});
    },
  });

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center gap-3"><button onClick={()=>navigate('/sales')} className="h-8 w-8 rounded-[8px] border border-border bg-card flex items-center justify-center hover:bg-accent">←</button><div><h1 className="text-[20px] font-[700] tracking-[-0.02em] leading-none">{t('sale.newSale')}</h1><p className="text-[12px] text-muted-foreground mt-1">{t('sale.metrics')} • Fylo ultra-fast</p></div></div>

      <div className="rounded-[16px] border border-border bg-card p-6 space-y-5">
        <SearchableSelect label={`${t('sale.product')} *`} options={(products||[]).map(p=>({ label:`${p.name} — ${p.currentQuantity} ${t('dashboard.units')} • $${p.unitCost.toFixed(2)}`, value:p._id }))} value={productId} onChange={v=>{ setProductId(v); const prod = products.find(p=>p._id===v); if(prod) setSellingPrice(prod.minSellingPrice); }} placeholder={t('sale.selectProduct')} />

        {selected && (
          <div className="rounded-[12px] border border-border bg-muted/40 p-4 grid grid-cols-3 gap-3 text-[12px]">
            <div><div className="text-muted-foreground text-[11px] uppercase font-[650] tracking-[0.06em]">{t('sale.currentStock')}</div><div className="font-[700] text-[14px] tabular-nums">{selected.currentQuantity}</div></div>
            <div><div className="text-muted-foreground text-[11px] uppercase font-[650] tracking-[0.06em]">{t('sale.unitCost')}</div><div className="font-[700] text-[14px] tabular-nums">${selected.unitCost.toFixed(2)}</div></div>
            <div><div className="text-muted-foreground text-[11px] uppercase font-[650] tracking-[0.06em]">{t('sale.minPrice')}</div><div className="font-[700] text-[14px] tabular-nums">${selected.minSellingPrice.toFixed(2)}</div></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label={`${t('sale.quantity')} *`} value={quantity} onValueChange={setQuantity} />
          <NumberInput label={`${t('sale.sellingPrice')} *`} value={sellingPrice} onValueChange={setSellingPrice} />
        </div>

        <div className="rounded-[12px] bg-foreground text-background p-4 flex items-center justify-between">
          <div className="space-y-1 text-[12px]"><div className="opacity-70">{t('sale.revenue')}: ${metrics.revenue.toFixed(2)} — {t('sale.cost')}: ${metrics.cost.toFixed(2)}</div><div className="text-[11px] opacity-60">{t('sale.metrics')}</div></div>
          <div className={`text-[20px] font-[800] tracking-[-0.02em] tabular-nums ${metrics.profit>=0 ? 'text-emerald-300' : 'text-red-300'}`}>+${metrics.profit.toFixed(2)}</div>
        </div>

        <div>
          <button type="button" onClick={()=>setShowAdvanced(!showAdvanced)} className="text-[12px] font-[600] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">{showAdvanced ? t('common.hideAdvanced') : t('common.showAdvanced')}</button>
          {showAdvanced && (
            <div className="mt-4 grid gap-4 animate-[fadeIn_0.2s]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t('sale.customerName')} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Alex Rivera" />
                <Input label={t('sale.customerPhone')} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="+998..." />
              </div>
              <Input label={t('sale.customerAddress')} value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Tashkent, Chilanzar..." />
              <Textarea label={t('sale.comment')} value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder="Notes..." />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={()=>navigate('/sales')}>{t('common.cancel')}</Button>
          <Button loading={mut.isPending} onClick={()=>mut.mutate()} disabled={!productId || !quantity || !sellingPrice || (selected && quantity>selected.currentQuantity)}>{t('sale.newSale')}</Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import Button from '../../components/ui/Button';
import NumberInput from '../../components/ui/NumberInput';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const emptyRow = ()=>({ name:'', quantity:1, totalPurchasePrice:0, totalIntlShipping:0, totalLocalShipping:0, minSellingPrice:0, sku:'' });

export default function BulkEntry() {
  const { t } = useTranslation();
  const [rows, setRows] = useState(()=> Array.from({length:6}).map(emptyRow));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const updateCell = (r,c,val)=> setRows(prev=> prev.map((row,i)=> i===r ? { ...row, [c]: val } : row));

  const calcs = useMemo(()=> rows.map(r=>{
    const q = Number(r.quantity)||0;
    const unit = q ? (Number(r.totalPurchasePrice||0)+Number(r.totalIntlShipping||0)+Number(r.totalLocalShipping||0))/q : 0;
    const invalid = Number(r.minSellingPrice) < unit && r.minSellingPrice!=='' && unit>0;
    return { unit, invalid };
  }), [rows]);

  const addRow = ()=> setRows([...rows, emptyRow()]);
  const removeRow = (idx)=> setRows(rows.filter((_,i)=>i!==idx));

  const handleSubmit = async()=>{
    const filtered = rows.filter(r=> r.name.trim());
    if (!filtered.length) return toast.error(t('validation.productNameRequired'));
    if (calcs.some(c=>c.invalid)) return toast.error(t('validation.minPriceLow'));
    const payload = filtered.map(r=>({ ...r, quantity:Number(r.quantity), totalPurchasePrice:Number(r.totalPurchasePrice), totalIntlShipping:Number(r.totalIntlShipping), totalLocalShipping:Number(r.totalLocalShipping), minSellingPrice:Number(r.minSellingPrice), unitCost: (Number(r.totalPurchasePrice)+Number(r.totalIntlShipping)+Number(r.totalLocalShipping))/Number(r.quantity) }));
    setLoading(true);
    try{
      await api.post('/products/bulk', { products: payload });
      toast.success(`${payload.length} ${t('toast.created')}`);
      navigate('/products');
    }catch(e){ toast.error(e.response?.data?.message||t('toast.error')); }
    finally{ setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-[20px] font-[700] tracking-[-0.02em]">{t('product.bulkTitle')}</h1><p className="text-[12px] text-muted-foreground mt-1">{t('product.bulkTip')}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" leftIcon={<FiPlus className="h-4 w-4" />} onClick={addRow}>{t('product.addRow')}</Button><Button variant="outline" size="sm" onClick={()=>navigate('/products')}>{t('common.cancel')}</Button><Button size="sm" loading={loading} onClick={handleSubmit}>{t('product.saveAll')}</Button></div>
      </div>

      <div className="rounded-[14px] border border-border bg-card overflow-hidden">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur border-b border-border">
              <tr className="text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">
                <th className="text-left px-3 py-2.5 w-[40px]">#</th>
                <th className="text-left px-3 py-2.5 w-[220px]">{t('product.name')}</th>
                <th className="text-left px-3 py-2.5 w-[90px]">{t('product.quantity')}</th>
                <th className="text-left px-3 py-2.5 w-[120px]">{t('product.purchasePrice')}</th>
                <th className="text-left px-3 py-2.5 w-[110px]">Intl Ship</th>
                <th className="text-left px-3 py-2.5 w-[110px]">Local Ship</th>
                <th className="text-left px-3 py-2.5 w-[110px]">{t('product.unitCost')}</th>
                <th className="text-left px-3 py-2.5 w-[110px]">{t('product.minPrice')}</th>
                <th className="text-left px-3 py-2.5 w-[130px]">{t('product.sku')}</th>
                <th className="text-left px-3 py-2.5 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r,i)=>(
                <tr key={i} className={`${calcs[i].invalid ? 'bg-red-500/5' : 'hover:bg-accent/30'} transition-colors`}>
                  <td className="px-3 py-2 text-[12px] text-muted-foreground">{i+1}</td>
                  <td className="px-3 py-2"><input value={r.name} onChange={e=>updateCell(i,'name',e.target.value)} placeholder="Product name" className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground/20 focus:ring-2 focus:ring-foreground/[0.06]" /></td>
                  <td className="px-3 py-2"><input type="text" inputMode="numeric" value={r.quantity} onChange={e=>updateCell(i,'quantity',e.target.value.replace(/[^0-9]/g,''))} className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none focus:border-foreground/20 focus:ring-2 focus:ring-foreground/[0.06]" /></td>
                  <td className="px-3 py-2"><input type="text" inputMode="decimal" value={r.totalPurchasePrice} onChange={e=>updateCell(i,'totalPurchasePrice',e.target.value)} className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none" /></td>
                  <td className="px-3 py-2"><input type="text" value={r.totalIntlShipping} onChange={e=>updateCell(i,'totalIntlShipping',e.target.value)} className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none" /></td>
                  <td className="px-3 py-2"><input type="text" value={r.totalLocalShipping} onChange={e=>updateCell(i,'totalLocalShipping',e.target.value)} className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none" /></td>
                  <td className={`px-3 py-2 font-[650] tabular-nums text-[13px] ${calcs[i].invalid?'text-red-600':'text-foreground'}`}>${calcs[i].unit.toFixed(2)}</td>
                  <td className="px-3 py-2"><input type="text" value={r.minSellingPrice} onChange={e=>updateCell(i,'minSellingPrice',e.target.value)} className={`h-8 w-full rounded-[8px] border bg-background px-2.5 text-[13px] outline-none ${calcs[i].invalid?'border-red-500/60 ring-2 ring-red-500/10':'border-border'}`} /></td>
                  <td className="px-3 py-2"><input value={r.sku} onChange={e=>updateCell(i,'sku',e.target.value)} placeholder="SKU" className="h-8 w-full rounded-[8px] border border-border bg-background px-2.5 text-[13px] outline-none font-mono" /></td>
                  <td className="px-3 py-2"><button onClick={()=>removeRow(i)} className="h-8 w-8 rounded-[8px] border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center"><FiTrash2 className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

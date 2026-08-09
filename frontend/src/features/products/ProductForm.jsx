import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import NumberInput from '../../components/ui/NumberInput';
import { FormSkeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiChevronDown, FiDollarSign, FiBox } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  name: z.string().min(1, 'validation.productNameRequired'),
  quantity: z.coerce.number().min(1, 'validation.quantityMin'),
  totalPurchasePrice: z.coerce.number().min(0, 'validation.priceMin'),
  totalIntlShipping: z.coerce.number().min(0).default(0),
  totalLocalShipping: z.coerce.number().min(0).default(0),
  minSellingPrice: z.coerce.number().min(0, 'validation.priceMin'),
  description: z.string().optional(),
  sku: z.string().max(50).optional(),
});

export default function ProductForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(()=>{ try{ return localStorage.getItem('pf_advanced')==='1'; } catch { return false; } });

  const { data: product, isLoading } = useQuery({
    queryKey:['product', id],
    queryFn: async()=> (await api.get(`/products/${id}`)).data.data,
    enabled: isEdit,
    staleTime: 1000*60*5,
  });

  const { register, handleSubmit, watch, setValue, formState:{ errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { quantity:1, totalPurchasePrice:0, totalIntlShipping:0, totalLocalShipping:0, minSellingPrice:0, sku:'' },
  });

  useEffect(()=>{ localStorage.setItem('pf_advanced', showAdvanced?'1':'0'); }, [showAdvanced]);

  useEffect(()=>{ if(product){
    setValue('name', product.name);
    setValue('quantity', product.quantity);
    setValue('totalPurchasePrice', product.totalPurchasePrice);
    setValue('totalIntlShipping', product.totalIntlShipping||0);
    setValue('totalLocalShipping', product.totalLocalShipping||0);
    setValue('minSellingPrice', product.minSellingPrice);
    setValue('description', product.description||'');
    setValue('sku', product.sku||'');
    setImages(product.images||[]);
  } }, [product, setValue]);

  const vals = watch();
  const unitCost = useMemo(()=>{
    const q = Number(vals.quantity)||0;
    if (!q) return 0;
    return (Number(vals.totalPurchasePrice||0)+Number(vals.totalIntlShipping||0)+Number(vals.totalLocalShipping||0))/q;
  }, [vals.quantity, vals.totalPurchasePrice, vals.totalIntlShipping, vals.totalLocalShipping]);

  const minPriceInvalid = useMemo(()=> Number(vals.minSellingPrice) < unitCost && unitCost>0, [vals.minSellingPrice, unitCost]);

  const createMut = useMutation({
    mutationFn: async (data)=> {
      const payload = { ...data, unitCost, images, quantity: Number(data.quantity), totalPurchasePrice:Number(data.totalPurchasePrice), totalIntlShipping:Number(data.totalIntlShipping), totalLocalShipping:Number(data.totalLocalShipping), minSellingPrice:Number(data.minSellingPrice) };
      if (isEdit) return (await api.patch(`/products/${id}`, payload)).data;
      return (await api.post('/products', payload)).data;
    },
    onMutate: async (formData) => {
      // Optimistic ultra-fast
      if (!isEdit) {
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
          _id: tempId,
          name: formData.name,
          quantity: Number(formData.quantity),
          currentQuantity: Number(formData.quantity),
          totalPurchasePrice: Number(formData.totalPurchasePrice),
          totalIntlShipping: Number(formData.totalIntlShipping),
          totalLocalShipping: Number(formData.totalLocalShipping),
          unitCost,
          minSellingPrice: Number(formData.minSellingPrice),
          sku: formData.sku,
          status: 'in_stock',
          images,
        };
        // Add to products list cache instantly
        qc.setQueriesData({ queryKey:['products'] }, (old)=>{
          if (!old) return old;
          return { ...old, data: [optimistic, ...(old.data||[])] };
        });
        return { tempId, optimistic };
      } else {
        // For edit, update cache instantly
        qc.setQueryData(['product', id], (old)=> ({ ...old, ...formData, unitCost, images }));
        qc.setQueriesData({ queryKey:['products'] }, (old)=>{
          if (!old) return old;
          return { ...old, data: (old.data||[]).map(p=> p._id===id ? { ...p, ...formData, unitCost, images } : p) };
        });
      }
    },
    onSuccess: (res, _vars, ctx)=>{
      // Replace temp with real
      if (!isEdit && ctx?.tempId) {
        qc.setQueriesData({ queryKey:['products'] }, (old)=>{
          if (!old) return old;
          return { ...old, data: (old.data||[]).map(p=> p._id===ctx.tempId ? res.data : p) };
        });
      }
      toast.success(isEdit ? t('toast.updated') : t('toast.created'));
      qc.invalidateQueries({queryKey:['products']});
      qc.invalidateQueries({queryKey:['dashboard']});
      navigate('/products');
    },
    onError: (e, _vars, ctx)=>{
      // Rollback
      if (!isEdit && ctx?.tempId) {
        qc.setQueriesData({ queryKey:['products'] }, (old)=>{
          if (!old) return old;
          return { ...old, data: (old.data||[]).filter(p=> p._id!==ctx.tempId) };
        });
      }
      if (isEdit) {
        qc.invalidateQueries({queryKey:['product', id]});
        qc.invalidateQueries({queryKey:['products']});
      }
      toast.error(e.response?.data?.message||t('toast.error'));
    },
  });

  const handleImageUpload = async (e)=>{
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try{
      const form = new FormData();
      for (const f of files) form.append('images', f);
      const { data } = await api.post('/products/upload/images', form, { headers:{ 'Content-Type':'multipart/form-data' } });
      setImages(prev=>[...prev, ...data.data]);
      toast.success(t('toast.uploadSuccess'));
    }catch{ toast.error(t('toast.error')); }
    finally { setUploading(false); }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={()=>navigate('/products')} className="h-8 w-8 rounded-[8px] border border-border bg-card flex items-center justify-center hover:bg-accent">←</button>
        <div>
          <h1 className="text-[20px] font-[700] tracking-[-0.02em] leading-none">{isEdit ? t('product.edit') : t('product.create')}</h1>
          <p className="text-[12px] text-muted-foreground mt-1">{t('product.liveCalc')} • Fylo ultra-fast cache</p>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="space-y-5">
            <h3 className="text-[12px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">Essential • Tezkor</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input label={`${t('product.name')} *`} placeholder="iPhone 15 Pro Max 256GB" error={errors.name ? t(errors.name.message) : undefined} {...register('name')} autoFocus />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberInput label={`${t('product.quantity')} *`} value={vals.quantity} onValueChange={(v)=> setValue('quantity', v)} error={errors.quantity?.message} placeholder="0" />
                <NumberInput label={`${t('product.purchasePrice')} *`} value={vals.totalPurchasePrice} onValueChange={v=> setValue('totalPurchasePrice', v)} error={errors.totalPurchasePrice?.message} leftIcon={<FiDollarSign className="h-3.5 w-3.5" />} placeholder="0" />
                <NumberInput label={`${t('product.minPrice')} *`} value={vals.minSellingPrice} onValueChange={v=> setValue('minSellingPrice', v)} error={minPriceInvalid ? t('validation.minPriceLow') : errors.minSellingPrice?.message} leftIcon={<FiDollarSign className="h-3.5 w-3.5" />} placeholder="0" />
              </div>

              <div className="rounded-[12px] border border-border bg-muted/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[10px] bg-foreground text-background flex items-center justify-center"><FiBox className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">{t('product.unitCostLive')}</div>
                    <div className="text-[20px] font-[750] tracking-[-0.02em] tabular-nums">${unitCost.toFixed(2)}</div>
                    <div className="text-[11px] text-muted-foreground">{t('product.liveCalc')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">{t('product.inventoryValueCalc')}</div>
                  <div className="text-[14px] font-[650] tabular-nums">${(unitCost*(Number(vals.quantity)||0)).toFixed(2)}</div>
                  {minPriceInvalid && <div className="text-[11px] text-red-600 mt-1">{t('product.minPriceHint')}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <button type="button" onClick={()=>setShowAdvanced(!showAdvanced)} className="flex w-full items-center justify-between rounded-[10px] border border-dashed border-border bg-muted/20 px-3 py-2.5 text-[13px] font-[550] hover:bg-accent transition-colors">
              <span>{t('common.advanced')}</span>
              <span className="flex items-center gap-2"><span className="text-[11px] text-muted-foreground">{showAdvanced ? t('common.hideAdvanced') : t('common.showAdvanced')}</span><FiChevronDown className={`h-4 w-4 transition-transform ${showAdvanced?'rotate-180':''}`} /></span>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2, ease:[0.16,1,0.3,1] }} className="overflow-hidden">
                  <div className="pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberInput label={t('product.intlShipping')} value={vals.totalIntlShipping} onValueChange={v=> setValue('totalIntlShipping', v)} placeholder="0" hint="Total international shipping" />
                      <NumberInput label={t('product.localShipping')} value={vals.totalLocalShipping} onValueChange={v=> setValue('totalLocalShipping', v)} placeholder="0" hint="Total local shipping" />
                    </div>
                    <Input label={t('product.sku')} placeholder="IPH15PM-256-BLK" {...register('sku')} />
                    <Textarea label={t('product.description')} placeholder="Product details, condition, notes..." {...register('description')} rows={3} />

                    <div>
                      <label className="text-[12.5px] font-[550] text-muted-foreground">{t('product.images')}</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {images.map((img,i)=><div key={i} className="relative group"><img src={img.url} alt="" className="h-20 w-20 rounded-[10px] object-cover border border-border" /><button type="button" onClick={()=>setImages(images.filter((_,idx)=>idx!==i))} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"><FiX className="h-3 w-3" /></button></div>)}
                        <label className="h-20 w-20 rounded-[10px] border border-dashed border-border bg-muted/30 hover:bg-accent flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                          <FiUpload className="h-4 w-4" /><span className="text-[10px] font-[600]">{uploading ? '...' : 'Upload'}</span>
                          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" type="button" onClick={()=>navigate('/products')}>{t('common.cancel')}</Button>
            <Button type="button" loading={createMut.isPending} disabled={minPriceInvalid} onClick={handleSubmit(d=>createMut.mutate(d))}>{isEdit ? t('button.update') : t('button.create')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

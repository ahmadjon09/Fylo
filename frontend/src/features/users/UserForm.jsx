import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SearchableSelect } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSkeleton } from '../../components/ui/Skeleton';

export default function UserForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const qc = useQueryClient();
  const isEdit = !!id && id!=='new';
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { data: user, isLoading } = useQuery({
    queryKey:['user', id],
    queryFn: async()=> (await api.get(`/users/${id}`)).data.data,
    enabled: isEdit,
    staleTime: 1000*60*5,
  });

  const { register, handleSubmit, setValue, watch, formState:{ errors } } = useForm({
    defaultValues:{ fullName:'', phone:'', role:'worker', telegramId:'' },
  });
  const role = watch('role');

  useEffect(()=>{
    if(user){
      setValue('fullName', user.fullName);
      setValue('phone', user.phone);
      setValue('role', user.role);
      setValue('telegramId', user.telegramId||'');
    }
  },[user, setValue]);

  const onSubmit = async (formData) => {
    setSaving(true);
    // Optimistic update for instant feel
    const tempId = `temp-${Date.now()}`;
    const optimisticUser = { _id: tempId, ...formData, fullName: formData.fullName, phone: formData.phone, role: formData.role, isOnline: false };

    if (!isEdit) {
      // Instantly add to users list cache
      qc.setQueriesData({ queryKey:['users'] }, (old) => {
        if (!old) return old;
        return { ...old, data: [optimisticUser, ...(old.data||[])] };
      });
    }

    try{
      if (isEdit) {
        const { data } = await api.patch(`/users/${id}`, formData);
        // Update cache instantly
        qc.setQueryData(['user', id], data.data);
        toast.success(t('toast.updated'));
      } else {
        const { data } = await api.post('/users', { ...formData, password:'worker123' });
        // Replace optimistic with real
        qc.setQueriesData({ queryKey:['users'] }, (old) => {
          if (!old) return old;
          return { ...old, data: (old.data||[]).map(u=> u._id===tempId ? data.data : u) };
        });
        toast.success(t('toast.created'));
      }
      // Fire-and-forget invalidation
      qc.invalidateQueries({ queryKey:['users'] });
      navigate('/users');
    }catch(e){
      // Rollback optimistic
      if (!isEdit) {
        qc.setQueriesData({ queryKey:['users'] }, (old) => {
          if (!old) return old;
          return { ...old, data: (old.data||[]).filter(u=> u._id!==tempId) };
        });
      }
      toast.error(e.response?.data?.message||t('toast.error'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <FormSkeleton />;

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-center gap-3"><button onClick={()=>navigate('/users')} className="h-8 w-8 rounded-[8px] border border-border bg-card flex items-center justify-center hover:bg-accent">←</button><h1 className="text-[20px] font-[700] tracking-[-0.02em]">{isEdit? t('user.editUser') : t('user.newUser')}</h1></div>

      <div className="rounded-[16px] border border-border bg-card p-6 space-y-5">
        <div className="space-y-4">
          <Input label={`${t('user.fullName')} *`} error={errors.fullName?.message} {...register('fullName', { required:true })} placeholder="Alex Rivera" />
          <Input label={`${t('user.phone')} *`} error={errors.phone?.message} {...register('phone', { required:true })} placeholder="+998..." />
          <SearchableSelect label={`${t('user.role')} *`} options={[{label:t('user.roleAdmin'),value:'admin'},{label:t('user.roleWorker'),value:'worker'}]} value={role||'worker'} onChange={v=>setValue('role',v)} />
          <Input label={`${t('user.telegramId')} (${t('common.optional')})`} hint={t('user.telegramHint')} placeholder="123456789" {...register('telegramId')} />
          {!isEdit && <div className="rounded-[10px] bg-amber-500/10 border border-amber-500/20 p-3 text-[12px] text-amber-800 dark:text-amber-300">{t('user.defaultPasswordHint')}</div>}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={()=>navigate('/users')}>{t('common.cancel')}</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>{isEdit ? t('button.update') : t('button.create')}</Button>
        </div>
      </div>
    </div>
  );
}

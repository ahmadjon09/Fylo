import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PremiumTable } from '../../components/ui/Table';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMessageCircle, FiLoader } from 'react-icons/fi';

export default function UsersList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey:['users', search],
    queryFn: async()=> (await api.get('/users', { params:{ search: search||undefined, limit:50 } })).data,
    placeholderData:(p)=>p,
    staleTime: 1000*60*2,
  });

  const deleteMut = useMutation({
    mutationFn: async(id)=> { setDeletingId(id); return await api.delete(`/users/${id}`); },
    onMutate: async(id)=>{
      qc.setQueriesData({ queryKey:['users'] }, (old)=>{
        if (!old) return old;
        return { ...old, data: (old.data||[]).filter(u=>u._id!==id) };
      });
    },
    onSuccess: ()=>{ toast.success(t('toast.deleted')); qc.invalidateQueries({queryKey:['users']}); },
    onError: (e)=> { toast.error(e.response?.data?.message||t('toast.error')); qc.invalidateQueries({queryKey:['users']}); },
    onSettled: ()=> setDeletingId(null),
  });

  const columns = [
    { key:'avatar', title:'', width:'56px', render:(_,row)=> <img src={row.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${row.fullName}`} alt="" className="h-9 min-w-9 rounded-full border border-border object-cover" /> },
    { key:'fullName', title:t('user.fullName'), sortable:true, render:(v,row)=> <div><div className="font-[600] text-[13.5px]">{row.fullName} {row._id===me?.id && <span className="text-[11px] text-muted-foreground">(you)</span>}</div><div className="text-[11px] text-muted-foreground">{row.phone}</div></div> },
    { key:'role', title:t('user.role'), render:(v)=> <Badge variant={v==='super_admin'?'info':v==='admin'?'info':'success'}>{v==='super_admin'?'Super Admin':v}</Badge> },
    { key:'isOnline', title:t('user.online'), render:(v)=> <Badge variant={v?'success':'outline'}>{v? 'online':'offline'}</Badge> },
    { key:'lastActiveAt', title:t('user.lastActive'), render:(v)=> <span className="text-[12px] text-muted-foreground">{v ? new Date(v).toLocaleString() : '-'}</span> },
    { key:'actions', title:t('common.actions'), width:'140px', render:(_,row)=>{
      const isAnotherAdmin = row.role==='admin' && row._id!==me?.id;
      const isSuperAdmin = row.role==='super_admin' && me?.role!=='super_admin';
      const isSelf = row._id===me?.id;
      const disabledEdit = isSuperAdmin || isAnotherAdmin;
      const disabledDel = isSuperAdmin || isAnotherAdmin || isSelf;
      return (
        <div className="flex items-center gap-1">
          <button disabled={isSelf} title={isSelf ? 'Ozingizga yozib bolmaydi' : 'Xabar yozish'} onClick={()=>navigate(`/messages?user=${row._id}`)} className="h-8 w-8 rounded-[8px] border border-border bg-[#2AABEE]/10 text-[#2AABEE] hover:bg-[#2AABEE] hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"><FiMessageCircle className="h-3.5 w-3.5" /></button>
          <button disabled={disabledEdit} title={disabledEdit ? t('user.cannotEditAdmin') : ''} onClick={()=>navigate(`/users/${row._id}`)} className="h-8 w-8 rounded-[8px] border border-border bg-background hover:bg-accent disabled:opacity-30 flex items-center justify-center transition-colors">{deletingId===row._id ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiEdit2 className="h-3.5 w-3.5" />}</button>
          <button disabled={disabledDel} title={disabledDel ? (isSuperAdmin ? 'Super adminni ochirib bolmaydi' : isSelf ? t('user.cannotDeleteSelf') : t('user.cannotDeleteAdmin')) : ''} onClick={()=>{ if(confirm(t('user.deleteConfirm'))) deleteMut.mutate(row._id); }} className="h-8 w-8 rounded-[8px] border border-border bg-background hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-30 flex items-center justify-center transition-colors">{deletingId===row._id ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiTrash2 className="h-3.5 w-3.5" />}</button>
        </div>
      );
    } },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[12px] bg-foreground text-background flex items-center justify-center shrink-0"><FiUsers className="h-5 w-5" /></div>
          <div className="min-w-0"><h1 className="text-[22px] font-[750] tracking-[-0.03em] leading-none truncate">{t('user.title')} <span className="text-muted-foreground font-[500]">• {data?.pagination?.total||0}</span></h1><p className="text-[12px] text-muted-foreground mt-1">{t('user.members')}</p></div>
        </div>
        <div className="w-full sm:w-auto flex justify-stretch sm:justify-end">
          <Button size="sm" className="w-full sm:w-auto justify-center" leftIcon={<FiPlus className="h-4 w-4" />} onClick={()=>navigate('/users/new')}>{t('user.newUser')}</Button>
        </div>
      </div>

      <PremiumTable columns={columns} data={data?.data||[]} loading={isLoading} searchable={true} storageKey="users" searchValue={search} onSearch={setSearch} />
      <div className="rounded-[12px] border border-dashed border-border bg-muted/20 p-3 text-[12px] text-muted-foreground">ℹ️ {t('user.cannotEditAdmin')} • {t('user.cannotDeleteAdmin')} — {t('user.cannotDeleteSelf')} • Super adminni faqat super admin boshqaradi</div>
    </div>
  );
}

import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiUser, FiKey, FiSmartphone, FiUploadCloud } from 'react-icons/fi';

export default function Profile() {
  const { t } = useTranslation();
  const { user, fetchMe } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName||'');
  const [telegramId, setTelegramId] = useState(user?.telegramId||'');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = async()=>{
    try{ await api.patch('/users/me', { fullName, telegramId }); toast.success(t('toast.saved')); fetchMe(); }
    catch(e){ toast.error(e.response?.data?.message||t('toast.error')); }
  };

  const handleAvatar = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setAvatarUploading(true);
    try{
      const form = new FormData(); form.append('avatar', file);
      await api.post('/users/me/avatar', form, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success(t('toast.uploadSuccess')); fetchMe();
    }catch{ toast.error(t('toast.error')); }
    finally{ setAvatarUploading(false); }
  };

  const handlePassword = async()=>{
    try{ await api.post('/auth/change-password', { currentPassword, newPassword }); toast.success(t('toast.saved')); setCurrentPassword(''); setNewPassword(''); }
    catch(e){ toast.error(e.response?.data?.message||t('toast.error')); }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <h1 className="text-[22px] font-[750] tracking-[-0.03em]">{t('user.profile')}</h1>

      <div className="rounded-[16px] border border-border bg-card p-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative group">
          <img src={user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName||'U')}`} alt="" className="h-24 w-24 rounded-[16px] object-cover border border-border bg-muted" />
          <label className="absolute inset-0 rounded-[16px] bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-[600] cursor-pointer transition-opacity">
            <FiUploadCloud className="h-5 w-5" />{avatarUploading ? '...' : t('user.changeAvatar')}
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-[20px] font-[700] tracking-[-0.02em]">{user?.fullName}</div>
          <div className="text-[13px] text-muted-foreground">{user?.phone} • {user?.role}</div>
          <div className="flex gap-2 mt-2"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-[600] ${user?.isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-muted border-border'}`}><span className={`h-1.5 w-1.5 rounded-full ${user?.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />{user?.isOnline ? t('user.online') : t('user.offline')}</span><span className="rounded-full bg-secondary border border-border px-2.5 py-1 text-[11px] font-[500]">{user?.loginCount||0} logins</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-border bg-card p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-[13px] font-[650] tracking-[-0.01em]"><FiUser className="h-4 w-4" />{t('user.personalInfo')}</h3>
          <Input label={t('user.fullName')} value={fullName} onChange={e=>setFullName(e.target.value)} />
          <Input label={t('user.phone')} value={user?.phone||''} disabled />
          <Input label={t('user.telegramId')} value={telegramId} onChange={e=>setTelegramId(e.target.value)} placeholder="123456789" hint={t('user.telegramHint')} />
          <div className="flex justify-end pt-2"><Button onClick={handleUpdate}>{t('button.save')}</Button></div>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-[13px] font-[650] tracking-[-0.01em]"><FiKey className="h-4 w-4" />{t('user.changePassword')}</h3>
          <Input label={t('auth.currentPassword')} type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} />
          <Input label={t('auth.newPassword')} type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          <div className="flex justify-end pt-2"><Button onClick={handlePassword} disabled={!currentPassword||!newPassword}>{t('button.save')}</Button></div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-card p-6">
        <h3 className="flex items-center gap-2 text-[13px] font-[650] tracking-[-0.01em] mb-4"><FiSmartphone className="h-4 w-4" />{t('user.sessions')}</h3>
        <div className="space-y-2 max-h-[280px] overflow-auto">
          {(user?.devices||[]).slice(-10).reverse().map((d,i)=>(
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-[10px] bg-muted/40 border border-border/60 px-3 py-2.5 text-[12px]">
              <span className="truncate max-w-[320px]">{d.userAgent}</span><span className="font-mono text-[11px] text-muted-foreground">{d.ip} • {new Date(d.lastActive).toLocaleString()}</span>
            </div>
          ))}
          {!(user?.devices||[]).length && <p className="text-[13px] text-muted-foreground">{t('user.noDevices')}</p>}
        </div>
      </div>
    </div>
  );
}

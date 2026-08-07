import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PhoneInput from '../../components/ui/PhoneInput';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import toast from 'react-hot-toast';
import { FiUser, FiArrowRight } from 'react-icons/fi';

const schema = z.object({
  fullName: z.string().min(2, 'validation.nameMin'),
  phone: z.string().min(7, 'validation.phoneInvalid'),
  password: z.string().min(6, 'validation.passwordMin'),
  telegramId: z.string().optional(),
});

export default function Register() {
  const { register: regAction } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, setValue, formState:{ errors } } = useForm({ resolver: zodResolver(schema) });
  const phoneVal = watch('phone');

  const onSubmit = async (data) => {
    setLoading(true);
    try { await regAction(data); toast.success(t('auth.registerSuccess')); navigate('/'); }
    catch (e){ toast.error(e.response?.data?.message || t('toast.error')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-[10px] bg-foreground text-background flex items-center justify-center font-[800] text-[13px]">W</div><span className="text-[14px] font-[700] tracking-[-0.02em]">WareFlow</span></div>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[400px] space-y-8">
            <div className="space-y-2">
              <h1 className="text-[28px] font-[750] tracking-[-0.03em] leading-[1.1]">{t('auth.registerTitle')}</h1>
              <p className="text-[14px] leading-[1.5] text-muted-foreground">{t('auth.registerSub')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label={t('auth.fullName')} placeholder="Alex Rivera" leftIcon={<FiUser className="h-4 w-4" />} error={errors.fullName ? t(errors.fullName.message) : undefined} {...register('fullName')} />
              <PhoneInput label={t('auth.phone')} value={phoneVal} onChange={v=>setValue('phone', v)} error={errors.phone ? t(errors.phone.message) : undefined} />
              <Input label={t('auth.password')} type="password" placeholder="••••••••" error={errors.password ? t(errors.password.message) : undefined} {...register('password')} />
              <Input label={`${t('user.telegramId')} (${t('common.optional')})`} placeholder="123456789" hint={t('user.telegramHint')} {...register('telegramId')} />

              <Button type="submit" loading={loading} className="w-full" size="lg" rightIcon={<FiArrowRight className="h-4 w-4" />}>{t('auth.register')}</Button>
            </form>

            <div className="text-center text-[13px]"><span className="text-muted-foreground">{t('auth.haveAccount')} </span><Link to="/login" className="font-[600] text-foreground hover:underline underline-offset-4">{t('auth.signIn')}</Link></div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0a0a0b] border-l border-border">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,rgba(99,102,241,0.15),transparent),radial-gradient(40%_40%_at_20%_80%,rgba(16,185,129,0.12),transparent)]" />
        <div className="relative z-10 p-12 flex flex-col justify-end w-full max-w-[480px]">
          <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.04] backdrop-blur p-5 space-y-4">
            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] font-[650] tracking-[0.06em] uppercase text-white/60">Live Inventory</span></div>
            <div className="space-y-3">
              <div className="h-2.5 w-full rounded-full bg-white/[0.08] overflow-hidden"><div className="h-full w-[72%] bg-white rounded-full" /></div>
              <div className="grid grid-cols-3 gap-3 text-[11px]"><div className="rounded-[10px] bg-white/[0.06] p-3"><div className="text-white/50">Stock</div><div className="text-white font-[700] text-[14px]">1 248 units</div></div><div className="rounded-[10px] bg-white/[0.06] p-3"><div className="text-white/50">Value</div><div className="text-white font-[700] text-[14px]">$ 42k</div></div><div className="rounded-[10px] bg-white/[0.06] p-3"><div className="text-white/50">Profit</div><div className="text-emerald-300 font-[700] text-[14px]">+ $8.4k</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

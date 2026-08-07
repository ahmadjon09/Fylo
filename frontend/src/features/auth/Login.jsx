import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PhoneInput from '../../components/ui/PhoneInput';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import toast from 'react-hot-toast';
import { FiLock, FiArrowRight } from 'react-icons/fi';

const schema = z.object({
  phone: z.string().min(7, 'validation.phoneInvalid'),
  password: z.string().min(6, 'validation.passwordMin'),
});

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { phone: '+998901234567', password: 'admin123' }
  });
  const phoneVal = watch('phone');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success(t('toast.loginSuccess'));
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.message || t('toast.error'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-foreground text-background flex items-center justify-center font-[800] text-[13px]">W</div>
            <span className="text-[14px] font-[700] tracking-[-0.02em]">Fylo</span>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[380px] space-y-8">
            <div className="space-y-2">
              <h1 className="text-[28px] font-[750] tracking-[-0.03em] leading-[1.1]">{t('auth.welcome')}</h1>
              <p className="text-[14px] leading-[1.5] text-muted-foreground">{t('auth.welcomeSub')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <PhoneInput label={t('auth.phone')} value={phoneVal} onChange={v => setValue('phone', v)} error={errors.phone ? t(errors.phone.message) : undefined} />

              <Input label={t('auth.password')} type="password" placeholder={t('auth.passwordPlaceholder')} leftIcon={<FiLock className="h-4 w-4" />} error={errors.password ? t(errors.password.message) : undefined} {...register('password')} />

              <Button type="submit" loading={loading} className="w-full" size="lg" rightIcon={<FiArrowRight className="h-4 w-4" />}>
                {t('auth.login')}
              </Button>
            </form>
          </div>
        </div>

        <div className="p-6 text-center text-[11px] text-muted-foreground">© 2026 Fylo • Premium Warehouse OS</div>
      </div>

      {/* Right - Visual - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0a0a0b] dark:bg-[#050507] border-l border-border">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(99,102,241,0.15),transparent),radial-gradient(40%_40%_at_80%_80%,rgba(168,85,247,0.12),transparent),radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div />
          <div className="space-y-6 max-w-[420px]">
            <div className="inline-flex rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1 text-[11px] font-[600] tracking-[0.04em] uppercase text-white/70">Trusted by 2,400+ warehouses</div>
            <blockquote className="text-[28px] font-[650] tracking-[-0.02em] leading-[1.15] text-white">
              "Fylo cut our stock-taking from 3 days to 4 hours. The real-time sync is magical."
            </blockquote>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/40?img=12" className="h-9 w-9 rounded-full" alt="" />
              <div><div className="text-[13px] font-[600] text-white">Alex Rivera</div><div className="text-[12px] text-white/60">Ops Lead @ Stripe</div></div>
            </div>
          </div>
          <div className="flex gap-2 text-[11px] text-white/40">
            <span>Linear-inspired • Stripe-grade • Vercel-fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}

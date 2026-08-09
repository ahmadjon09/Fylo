import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiPackage, FiShoppingCart, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiMoon, FiSun, FiBox, FiShield, FiCpu, FiMessageCircle } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Button from '../ui/Button';
import AvatarPromptModal from '../common/AvatarPromptModal';
import HotkeysModal from '../common/HotkeysModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useGeolocation } from '../../hooks/useGeolocation';
import { getSocket } from '../../lib/socket';
import { GrSystem } from "react-icons/gr";
import { FaMoon, FaSun } from "react-icons/fa"
export const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [slow, setSlow] = useState(false);
  const navigate = useNavigate();
  const { location, requestLocation } = useGeolocation();

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await api.get('/messages/unread-count')).data.data,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); toast.success(t('offline.online')); };
    const onOffline = () => { setIsOnline(false); toast.error(t('offline.offline')); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const checkSlow = () => {
      if (navigator.connection) {
        const { effectiveType, downlink } = navigator.connection;
        setSlow(effectiveType?.includes('2g') || (downlink && downlink < 1));
      }
    };
    checkSlow();

    // Request location for audit logs — if user allows, else skip
    const hasAsked = localStorage.getItem('fylo:location:asked');
    if (!hasAsked && !location) {
      // Ask after 5s, not immediately to avoid annoyance
      setTimeout(() => {
        if (confirm('Fylo жойлашувингизни аудит учун ишлатадими? (Ихтиёрий) — Location for audit logs?')) {
          requestLocation().then(loc => {
            const s = getSocket();
            if (s?.connected) s.emit('location:update', loc);
          }).catch(() => { });
        }
        localStorage.setItem('fylo:location:asked', '1');
      }, 5000);
    } else if (location) {
      const s = getSocket();
      if (s?.connected) s.emit('location:update', location);
    }

    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [t]);

  // Send location to socket when it connects
  useEffect(() => {
    if (location) {
      const s = getSocket();
      if (s?.connected) s.emit('location:update', location);
    }
  }, [location]);

  const nav = [
    { to: '/', icon: FiGrid, label: t('nav.dashboard'), roles: ['admin', 'super_admin'], exact: true },
    { to: '/products', icon: FiPackage, label: t('nav.products'), roles: ['admin', 'super_admin', 'worker'] },
    { to: '/sales', icon: FiShoppingCart, label: t('nav.sales'), roles: ['admin', 'super_admin', 'worker'] },
    { to: '/messages', icon: FiMessageCircle, label: 'Хабарлар • Messages', roles: ['admin', 'super_admin', 'worker'], badge: unread?.total },
    { to: '/users', icon: FiUsers, label: t('nav.users'), roles: ['admin', 'super_admin'] },
    { to: '/audit', icon: FiShield, label: 'Аудит • Audit', roles: ['super_admin'] },
    { to: '/system', icon: FiCpu, label: 'Тизим • System', roles: ['super_admin'] },
    { to: '/profile', icon: FiUser, label: t('nav.profile'), roles: ['admin', 'super_admin', 'worker'] },
  ].filter(item => !user || item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', fontSize: '13px', fontWeight: 500 } }} />
      <AvatarPromptModal />
      <HotkeysModal />

      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-card
        transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-[64px] items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-foreground text-background font-[800] text-[14px] tracking-[-0.02em] relative">F<span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" /></div>
            <div className="leading-none">
              <div className="text-[14px] font-[700] tracking-[-0.02em]">Fylo</div>
              <div className="text-[11px] font-[500] text-muted-foreground mt-0.5">OS • @FyloRobot • v1.0</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden h-8 w-8 rounded-[8px] hover:bg-accent flex items-center justify-center"><FiX className="h-4 w-4" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-none">
          <div className="space-y-1">
            <div className="px-2.5 py-1.5 text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">Fylo Workspace</div>
            {nav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-[500] tracking-[-0.01em] transition-all
                    ${isActive ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <span className="ml-auto h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-[700] flex items-center justify-center">{item.badge}</span> : null}
                </NavLink>
              );
            })}
          </div>

          <div className="rounded-[12px] border border-border bg-muted/40 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-[650] uppercase tracking-[0.06em] text-muted-foreground">Connection</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-[600] ${isOnline ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />{isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {slow && <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-amber-500" />{t('offline.slow')}</div>}
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <FiBox className="h-3.5 w-3.5" /> Fylo • {user?.role === 'super_admin' ? 'Супер Админ' : user?.role}
            </div>
          </div>
        </nav>

        <div className="border-t border-border p-3 space-y-3">
          <div className="flex items-center gap-2.5 rounded-[12px] bg-muted/60 border border-border/60 p-2.5">
            <img src={user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || 'U')}`} alt="" className="h-8 w-8 rounded-[8px] object-cover bg-background" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-[600] tracking-[-0.01em]">{user?.fullName}</div>
              <div className="text-[11px] text-muted-foreground capitalize flex items-center gap-1">{user?.role === 'super_admin' ? 'Супер Админ' : user?.role} {isOnline && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}</div>
            </div>
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'} shrink-0`} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <LanguageSwitcher compact dropUp />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
              className="h-8 flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-background text-[12px] font-[550] hover:bg-accent"
            >
              {theme === 'dark' ? <FaMoon /> : theme === 'light' ? <FaSun /> : <GrSystem />}
              <span className="capitalize">{theme}</span>
            </button>
          </div>

          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-600" leftIcon={<FiLogOut className="h-4 w-4" />} onClick={async () => { await logout(); navigate('/login'); }}>
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-20 flex h-[56px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-[12px] px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="h-9 w-9 rounded-[10px] border border-border bg-card flex items-center justify-center"><FiMenu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[8px] bg-foreground text-background flex items-center justify-center font-[800] text-[12px] relative">F<span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-background" /></div>
            <span className="text-[14px] font-[700] tracking-[-0.02em]">Fylo</span>
          </div>
          <div className="flex items-center gap-2">
            {unread?.total ? <span className="h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-[700] flex items-center justify-center">{unread.total}</span> : null}
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
        </header>

        {!isOnline && <div className="bg-red-600 text-white text-center text-[12.5px] font-[500] py-2 px-4">{t('offline.offline')} — {t('offline.check')}</div>}
        {slow && isOnline && <div className="bg-amber-500 text-white text-center text-[12.5px] font-[500] py-2 px-4">{t('offline.slow')}</div>}

        <main className="min-h-[calc(100vh-56px)] lg:min-h-screen">
          <div className="mx-auto max-w-[1280px] w-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

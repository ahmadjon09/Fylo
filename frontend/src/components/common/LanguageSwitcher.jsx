import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const FlagUZ = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" className="rounded-[2px] overflow-hidden shrink-0"><rect width="18" height="13" fill="#0099B5" />
    <rect width="18" height="4.33" y="4.33" fill="#FFFFFF" /><rect width="18" height="4.33" y="8.66" fill="#1EB53A" />
    <g fill="white"></g></svg>
);
const FlagRU = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" className="rounded-[2px] overflow-hidden shrink-0"><rect width="18" height="4.33" fill="#fff" /><rect width="18" height="4.33" y="4.33" fill="#0039A6" /><rect width="18" height="4.33" y="8.66" fill="#D52B1E" /></svg>
);
const FlagGB = () => (
  <svg width="18" height="13" viewBox="0 0 18 13" className="rounded-[2px] overflow-hidden shrink-0"><rect width="18" height="13" fill="#012169" /><path d="M0 0 L18 13 M18 0 L0 13" stroke="#fff" strokeWidth="2.5" /><path d="M0 0 L18 13 M18 0 L0 13" stroke="#C8102E" strokeWidth="1.5" /><rect x="7.5" width="3" height="13" fill="#fff" /><rect x="8.2" width="1.6" height="13" fill="#C8102E" /><rect y="5" width="18" height="3" fill="#fff" /><rect y="5.7" width="18" height="1.6" fill="#C8102E" /></svg>
);

const langs = [
  { code: 'uz', native: "O'zbek", name: "O'zbek", flag: <FlagUZ /> },
  { code: 'uz-Cyrl', native: "Ўзбек", name: "Ўзбек", flag: <FlagUZ /> },
  { code: 'ru', native: "Русский", name: "Русский", flag: <FlagRU /> },
  { code: 'en', native: "English", name: "English", flag: <FlagGB /> },
];

export default function LanguageSwitcher({ compact = false, dropUp = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = langs.find(l => l.code === i18n.language) || langs[3];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-[10px] border border-border bg-background px-2.5 py-1.5 text-[13px] font-[500] hover:bg-accent transition-colors ${compact ? 'h-8' : 'h-9'}`}
      >
        <span className="flex items-center gap-2">{current.flag}<span className="hidden sm:inline">{compact ? current.native : current.name}</span><span className="sm:hidden">{current.native}</span></span>
        <FiChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? (dropUp ? '' : 'rotate-180') : (dropUp ? 'rotate-180' : '')}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`
              absolute z-50 w-[260px] rounded-[14px] border border-border bg-card p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
              ${dropUp ? 'bottom-[calc(100%+8px)] right-0 sm:left-0 sm:right-0' : 'left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)]'}
            `}
          >
            <div className="px-2.5 py-2 text-[11px] font-[650] tracking-[0.06em] uppercase text-muted-foreground">Language</div>
            {langs.map(l => {
              const active = i18n.language === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
                  className={`w-full flex items-center justify-between rounded-[10px] px-2.5 py-2.5 text-left text-[13px] transition-colors ${active ? 'bg-foreground text-background' : 'hover:bg-accent'}`}
                >
                  <span className="flex items-center gap-2.5">{l.flag}<span className="flex flex-col leading-tight"><span className="font-[550]">{l.name}</span><span className={`text-[11px] ${active ? 'text-background/70' : 'text-muted-foreground'}`}>{l.native}</span></span></span>
                  {active && <FiCheck className="h-4 w-4" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

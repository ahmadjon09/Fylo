import { useState, useEffect } from 'react';
import { FiCommand, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HotkeysModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const handler = (e)=>{
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setOpen(o=>!o);
      }
      if (e.key === '?' && e.shiftKey) {
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return ()=>window.removeEventListener('keydown', handler);
  },[]);

  const groups = [
    {
      title: 'Умумий • Общее • General',
      items: [
        { k: 'Ctrl + /', d: 'Қисқа тугмаларни кўриш / Показать хоткеи / Show hotkeys' },
        { k: 'Esc', d: 'Ёпиш / Закрыть / Close modal' },
        { k: 'Tab', d: 'Кейинги майдон / Следующее поле / Next field' },
        { k: 'Shift + Tab', d: 'Олдинги майдон / Предыдущее поле / Prev field' },
      ]
    },
    {
      title: 'Рақамли майдонлар • Числовые поля • Number Inputs',
      items: [
        { k: '← →', d: 'Курсорни ҳаракатлантириш / Двигать курсор / Move cursor — курсор сакрамайди' },
        { k: '↑ ↓', d: 'Қийматни ошириш/камайтириш / Увеличить/уменьшить / Increase/decrease (тез орада)' },
        { k: 'Ctrl + A', d: 'Ҳаммасини белгилаш / Выделить всё / Select all' },
        { k: '1 000 → 1 000 000', d: 'Автоматик бўш жой билан форматлаш / Авто-форматирование / Auto space formatting' },
        { k: 'Mouse Wheel', d: 'Ўчирилган — тасодифий ўзгариш йўқ / Отключено / Disabled — no accidental change' },
        { k: 'Copy / Paste', d: 'Қўллаб-қувватланади / Поддерживается / Supported' },
      ]
    },
    {
      title: 'Жадваллар • Таблицы • Tables',
      items: [
        { k: 'Click Header', d: 'Саралаш / Сортировка / Sort' },
        { k: 'Eye icon', d: 'Устунни яшириш/кўрсатиш — local да сақланади / Скрыть/показать колонку / Hide/show column — saved locally' },
        { k: 'Search', d: 'Жонли қидириш / Живой поиск / Live search' },
      ]
    },
    {
      title: 'Формалар • Формы • Forms',
      items: [
        { k: 'Enter', d: 'Сақлаш / Сохранить / Save' },
        { k: '← Back', d: 'Орқага / Назад / Back' },
        { k: 'Advanced', d: 'Кўпроқ майдонларни очади — ҳолати сақланади / Дополнительные поля / Advanced fields — remembers state' },
      ]
    },
  ];

  return (
    <>
      <button onClick={()=>setOpen(true)} className="fixed bottom-4 right-4 z-40 h-9 w-9 rounded-full bg-foreground text-background shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-105 transition-transform" title="Hotkeys ? / Ctrl+/">
        <FiCommand className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={()=>setOpen(false)} />
            <motion.div initial={{ opacity:0, y:12, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:12, scale:0.98 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }} className="relative w-full max-w-[640px] rounded-[16px] border border-border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-auto">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-[10px] bg-foreground text-background flex items-center justify-center"><FiCommand className="h-4 w-4" /></div><div><h3 className="text-[15px] font-[700]">Fylo — Қисқа тугмалар • Горячие клавиши • Hotkeys</h3><p className="text-[11px] text-muted-foreground">Барча 3 тилда • На 3 языках • In 3 languages</p></div></div>
                <button onClick={()=>setOpen(false)} className="h-8 w-8 rounded-[8px] bg-muted flex items-center justify-center"><FiX className="h-4 w-4" /></button>
              </div>
              <div className="p-5 space-y-6">
                {groups.map((g,i)=><div key={i} className="space-y-2"><h4 className="text-[12px] font-[700] tracking-[0.04em] uppercase text-muted-foreground">{g.title}</h4><div className="rounded-[12px] border border-border overflow-hidden divide-y divide-border/60">{g.items.map((it,j)=><div key={j} className="flex items-center justify-between gap-3 p-3 hover:bg-accent/40"><span className="text-[12px] font-[600] px-2 py-1 rounded-[6px] bg-secondary border border-border whitespace-nowrap">{it.k}</span><span className="text-[12px] text-muted-foreground text-right flex-1">{it.d}</span></div>)}</div></div>)}
                <div className="rounded-[12px] bg-foreground text-background p-4 text-[12px] leading-[1.5]"><span className="font-[700]">Fylo</span> — NumberInput: 1000 ёзсангиз автоматик 1 000 бўлади, курсор сакрамайди, mouse wheel ўчирилган, copy/paste ишлайди. Барча inputлар Tab, Shift+Tab, ←→ билан бошқарилади. @FyloRobot</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

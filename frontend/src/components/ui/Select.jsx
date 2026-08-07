import { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchableSelect = ({ label, options=[], value, onChange, placeholder='Select...', error, icon, disabled }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedIdx, setFocusedIdx] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(()=>{
    if (!query) return options;
    return options.filter(o=> (o.label||o.toString()).toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  useEffect(()=>{
    const handler = (e)=>{ if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return ()=>document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(()=>{ if(open) setTimeout(()=>inputRef.current?.focus(), 40); }, [open]);

  const selected = useMemo(()=> options.find(o=> (o.value ?? o) === value), [options, value]);

  const handleKey = (e)=>{
    if (!open) return;
    if (e.key==='ArrowDown'){ e.preventDefault(); setFocusedIdx(i=> Math.min(i+1, filtered.length-1)); }
    else if (e.key==='ArrowUp'){ e.preventDefault(); setFocusedIdx(i=> Math.max(i-1, 0)); }
    else if (e.key==='Enter'){ e.preventDefault(); const opt=filtered[focusedIdx]; if(opt){ onChange(opt.value ?? opt); setOpen(false); setQuery(''); } }
    else if (e.key==='Escape'){ setOpen(false); }
  };

  return (
    <div ref={ref} className="group flex flex-col gap-1.5 relative" onKeyDown={handleKey}>
      {label && <label className="text-[12.5px] font-[550] text-muted-foreground">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={()=>!disabled && setOpen(!open)}
        className={`
          flex h-10 w-full items-center justify-between rounded-[10px] border bg-background px-3 text-[14px] font-[450]
          transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/[0.06] focus-visible:border-foreground/20
          disabled:opacity-60 disabled:cursor-not-allowed
          ${error ? 'border-red-500/60 ring-4 ring-red-500/10' : 'border-input hover:border-foreground/20'}
          ${open ? 'border-foreground/20 ring-4 ring-foreground/[0.06]' : ''}
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {selected ? <span className="flex items-center gap-2">{selected.icon && <span>{selected.icon}</span>}{selected.label ?? selected}</span> : <span className="text-muted-foreground/60">{placeholder}</span>}
        </span>
        <FiChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open?'rotate-180':''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:4, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:4, scale:0.98 }}
            transition={{ duration:0.15, ease:[0.16,1,0.3,1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[12px] border border-border bg-popover bg-background shadow-[0_8px_24px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <div className="p-2 border-b border-border">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e=>{ setQuery(e.target.value); setFocusedIdx(0); }}
                  placeholder="Search..."
                  className="h-8 w-full rounded-[8px] bg-muted pl-8 pr-2 text-[13px] outline-none placeholder:text-muted-foreground/60 focus:bg-accent"
                />
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto p-1 scrollbar-none">
              {filtered.length===0 ? (
                <div className="px-2.5 py-6 text-center text-[13px] text-muted-foreground">No results</div>
              ) : filtered.map((opt,i)=>{
                const val = opt.value ?? opt;
                const isActive = val===value;
                const isFocused = i===focusedIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={()=>{ onChange(val); setOpen(false); setQuery(''); }}
                    className={`
                      flex w-full items-center justify-between rounded-[8px] px-2.5 py-2 text-left text-[13px] font-[450]
                      transition-colors
                      ${isActive ? 'bg-foreground text-background' : ''}
                      ${!isActive && isFocused ? 'bg-accent' : ''}
                      ${!isActive && !isFocused ? 'hover:bg-accent' : ''}
                    `}
                  >
                    <span className="flex items-center gap-2 truncate">{opt.icon && <span>{opt.icon}</span>}{opt.label ?? opt}</span>
                    {isActive && <FiCheck className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  );
};

export default SearchableSelect;

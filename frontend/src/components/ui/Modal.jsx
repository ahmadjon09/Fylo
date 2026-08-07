import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export const Modal = ({ open, onClose, title, children, size='md', className='' }) => {
  useEffect(()=>{
    if (!open) return;
    const onEsc = (e)=>{ if(e.key==='Escape') onClose?.(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow='hidden';
    return ()=>{ document.removeEventListener('keydown', onEsc); document.body.style.overflow=''; };
  }, [open, onClose]);

  const sizes = { sm:'max-w-[420px]', md:'max-w-[560px]', lg:'max-w-[720px]', xl:'max-w-[960px]', full:'max-w-[90vw]' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity:0, y:12, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:12, scale:0.98 }}
            transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
            className={`relative w-full ${sizes[size]} rounded-[16px] border border-border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] max-h-[90vh] flex flex-col overflow-hidden ${className}`}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-[15px] font-[650] tracking-[-0.01em]">{title}</h3>
                <button onClick={onClose} className="h-8 w-8 rounded-[8px] bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><FiX className="h-4 w-4" /></button>
              </div>
            )}
            <div className="overflow-auto p-5 scrollbar-none flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

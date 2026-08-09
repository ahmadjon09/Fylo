import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiUploadCloud, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AvatarPromptModal() {
  const { t } = useTranslation();
  const { user, fetchMe } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(()=>{
    if (!user) return;
    const hasAvatar = !!user.avatar?.url;
    if (hasAvatar) return;
    const lastPrompt = localStorage.getItem('fylo:avatar:prompt');
    const now = Date.now();
    if (lastPrompt && now - parseInt(lastPrompt) < 24*60*60*1000) return; // once per day

    const timer = setTimeout(()=>{
      setOpen(true);
      localStorage.setItem('fylo:avatar:prompt', now.toString());
    }, 15000); // show after 15s if no avatar

    return ()=>clearTimeout(timer);
  },[user]);

  const handleUpload = async(e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    try{
      const form = new FormData(); form.append('avatar', file);
      await api.post('/users/me/avatar', form, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success('Аватар юкланди');
      fetchMe();
      setOpen(false);
    }catch{ toast.error('Хатолик'); }
    finally{ setUploading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={()=>setOpen(false)} />
          <motion.div initial={{ opacity:0, y:20, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.98 }} className="relative w-full max-w-[380px] rounded-[16px] border border-border bg-card p-6 shadow-[0_16px_40px_rgba(0,0,0,0.15)]">
            <button onClick={()=>setOpen(false)} className="absolute top-3 right-3 h-7 w-7 rounded-[8px] bg-muted flex items-center justify-center"><FiX className="h-4 w-4" /></button>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-full bg-muted border border-border flex items-center justify-center"><FiUser className="h-8 w-8 text-muted-foreground" /></div>
              <div><h3 className="text-[16px] font-[700]">Аватар юкланг — Fylo</h3><p className="text-[12px] text-muted-foreground mt-1">Профилингизга расм қўшинг, жамоа сизни тез танисин. @FyloRobot</p></div>
              <label className="mt-2 w-full h-10 rounded-[12px] bg-foreground text-background flex items-center justify-center gap-2 text-[13px] font-[600] cursor-pointer hover:opacity-90">
                <FiUploadCloud className="h-4 w-4" />{uploading ? 'Юкланмоқда...' : 'Расм танлаш'}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              <button onClick={()=>setOpen(false)} className="text-[12px] text-muted-foreground hover:text-foreground">Кейинроқ</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function PhoneInput({ value, onChange, label, error, hint }) {
  return (
    <div className="flex flex-col gap-1.5 group">
      {label && <label className="text-[12.5px] font-[550] tracking-[-0.01em] text-muted-foreground group-[.has-error]:text-red-600">{label}</label>}
      <div className={`
        relative flex h-10 items-center rounded-[10px] border bg-background px-3 transition-all
        ${error ? 'border-red-500/60 ring-4 ring-red-500/10 has-error' : 'border-input hover:border-foreground/20 focus-within:border-foreground/20 focus-within:ring-4 focus-within:ring-foreground/[0.06] dark:focus-within:ring-white/[0.08]'}
      `}>
        <PhoneInputLib
          international
          defaultCountry="UZ"
          value={value}
          onChange={onChange}
          className="w-full"
        />
      </div>
      <style>{`
        .PhoneInput { display:flex; align-items:center; width:100%; gap:8px; }
        .PhoneInputCountry { display:flex; align-items:center; }
        .PhoneInputCountryIcon { width:20px; height:14px; border-radius:3px; overflow:hidden; box-shadow:0 0 0 1px rgba(0,0,0,0.08); }
        .PhoneInputCountrySelect { position:absolute; opacity:0; width:0; height:0; }
        .PhoneInputCountrySelectArrow { display:none; }
        .PhoneInputInput { flex:1; border:0; background:transparent; outline:none; font-size:14px; font-weight:450; color:hsl(var(--foreground)); width:100%; }
        .PhoneInputInput::placeholder { color:hsl(var(--muted-foreground) / 0.6); }
      `}</style>
      {error ? <span className="text-[12px] font-[450] text-red-600 animate-[fadeIn_0.2s]">{error}</span> : hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

import { forwardRef, useState } from 'react';

const Input = forwardRef(({ label, error, hint, leftIcon, rightIcon, className='', containerClassName='', ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`group flex flex-col gap-1.5 ${containerClassName}`}>
      {label && <label className="text-[12.5px] font-[550] tracking-[-0.01em] text-muted-foreground group-[.has-error]:text-red-600">{label}</label>}
      <div className={`
        relative flex items-center
        h-10 rounded-[10px] border bg-background
        transition-all duration-150
        ${focused ? 'border-foreground/20 ring-4 ring-foreground/[0.06] dark:ring-white/[0.08]' : 'border-input hover:border-foreground/20'}
        ${error ? 'border-red-500/60 ring-4 ring-red-500/10 has-error' : ''}
        ${props.disabled ? 'opacity-60 bg-muted' : ''}
      `}>
        {leftIcon && <span className="pl-3 text-muted-foreground">{leftIcon}</span>}
        <input
          ref={ref}
          onFocus={(e)=>{ setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)=>{ setFocused(false); props.onBlur?.(e); }}
          className={`flex-1 h-full w-full bg-transparent px-3 text-[14px] font-[450] placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {rightIcon && <span className="pr-3 text-muted-foreground">{rightIcon}</span>}
      </div>
      {error ? <span className="text-[12px] font-[450] text-red-600 animate-[fadeIn_0.2s]">{error}</span> : hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
});
Input.displayName='Input';
export default Input;

export const Textarea = forwardRef(({ label, error, hint, className='', containerClassName='', ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`group flex flex-col gap-1.5 ${containerClassName}`}>
      {label && <label className="text-[12.5px] font-[550] text-muted-foreground">{label}</label>}
      <div className={`
        relative rounded-[10px] border bg-background transition-all
        ${focused ? 'border-foreground/20 ring-4 ring-foreground/[0.06]' : 'border-input hover:border-foreground/20'}
        ${error ? 'border-red-500/60 ring-4 ring-red-500/10' : ''}
      `}>
        <textarea
          ref={ref}
          onFocus={(e)=>{ setFocused(true); props.onFocus?.(e); }}
          onBlur={(e)=>{ setFocused(false); props.onBlur?.(e); }}
          className={`w-full bg-transparent px-3 py-2.5 text-[14px] font-[450] outline-none resize-y min-h-[88px] ${className}`}
          {...props}
        />
      </div>
      {error ? <span className="text-[12px] text-red-600">{error}</span> : hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
});
Textarea.displayName='Textarea';

import { forwardRef, useRef, useState, useEffect, useCallback } from 'react';

/**
 * Premium number input with space thousands separator
 * - 1000 -> 1 000, 1000000 -> 1 000 000
 * - Cursor never jumps
 * - Wheel disabled
 * - Paste support
 */

function formatWithSpaces(value) {
  if (value === '' || value === '-' || value === null || value === undefined) return '';
  const str = String(value);
  if (str === '') return '';
  // Handle decimal part
  const parts = str.split('.');
  let intPart = parts[0];
  const isNegative = intPart.startsWith('-');
  if (isNegative) intPart = intPart.slice(1);
  intPart = intPart.replace(/\D/g, ''); // keep digits only
  if (intPart === '') intPart = '0';
  // Add spaces every 3 digits from right
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (isNegative) intPart = '-' + intPart;
  if (parts.length > 1) {
    // Keep decimal up to 2 places? Allow as typed
    const dec = parts[1].replace(/[^0-9]/g, '').slice(0, 2);
    return dec ? `${intPart}.${dec}` : `${intPart}.`;
  }
  return intPart;
}

function unformat(value) {
  if (!value) return '';
  // Remove spaces, keep digits, dot, minus
  return String(value).replace(/\s/g, '').replace(/[^0-9.\-]/g, '');
}

const NumberInput = forwardRef(({ label, error, hint, value, onValueChange, onChange, defaultValue, className='', containerClassName='', leftIcon, rightIcon, allowNegative=false, allowDecimal=true, ...props }, ref) => {
  const innerRef = useRef(null);
  const [display, setDisplay] = useState(() => formatWithSpaces(value ?? defaultValue ?? ''));
  const [focused, setFocused] = useState(false);

  // Sync external value
  useEffect(()=> {
    const formatted = formatWithSpaces(value ?? '');
    if (!focused) setDisplay(formatted);
    else {
      // When focused we still sync if external changed significantly
      const unf = unformat(display);
      const extUnf = unformat(String(value ?? ''));
      if (unf !== extUnf) setDisplay(formatted);
    }
  }, [value]);

  const handleChange = useCallback((e) => {
    const input = e.target;
    const raw = input.value;
    const selectionStart = input.selectionStart;
    const prev = display;

    // Count spaces before cursor in previous
    const prevSpacesBeforeCursor = (prev.slice(0, selectionStart).match(/ /g) || []).length;

    let cleaned = unformat(raw);
    if (!allowNegative) cleaned = cleaned.replace(/-/g, '');
    if (!allowDecimal) cleaned = cleaned.replace(/\./g, '');

    // Handle multiple dots / minus edge cases
    if (cleaned) {
      // Keep only first dot
      const dotIdx = cleaned.indexOf('.');
      if (dotIdx !== -1) cleaned = cleaned.slice(0, dotIdx+1) + cleaned.slice(dotIdx+1).replace(/\./g, '');
      // Keep minus only at start
      if (cleaned.includes('-')) {
        const neg = cleaned.startsWith('-') ? '-' : '';
        cleaned = neg + cleaned.replace(/-/g, '');
      }
    }

    // Prevent leading zeros madness but allow 0
    if (cleaned.startsWith('0') && cleaned.length>1 && !cleaned.startsWith('0.') && !cleaned.startsWith('-')) {
      cleaned = cleaned.replace(/^0+/, '') || '0';
    }

    const formatted = formatWithSpaces(cleaned);

    // Calculate new cursor position preserving logical position
    // Logical position = number of non-space chars before cursor
    const prevUnformattedBefore = unformat(prev.slice(0, selectionStart)).length;
    // Now find position in formatted that corresponds to that count
    let newPos = 0;
    let seen = 0;
    for (let i=0; i<formatted.length; i++) {
      if (formatted[i] !== ' ') seen++;
      if (seen >= prevUnformattedBefore) { newPos = i+1; break; }
      newPos = i+1;
    }
    // If typing at end, go to end
    if (selectionStart === prev.length) newPos = formatted.length;
    // If deletion, adjust
    if (formatted.length < prev.length && selectionStart < prev.length) {
      // keep calculated
    }

    setDisplay(formatted);

    // Restore cursor async
    requestAnimationFrame(()=> {
      if (innerRef.current) {
        try { innerRef.current.setSelectionRange(newPos, newPos); } catch {}
      }
    });

    // Propagate
    const numVal = cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.' ? '' : Number(cleaned);
    if (onValueChange) onValueChange(cleaned === '' ? '' : numVal, cleaned);
    if (onChange) onChange({ target: { value: cleaned === '' ? '' : numVal, rawValue: cleaned } });
  }, [display, onValueChange, onChange, allowNegative, allowDecimal]);

  const handleFocus = (e)=>{
    setFocused(true);
    props.onFocus?.(e);
    // Select all on focus for quick replace? No, better not.
  };
  const handleBlur = (e)=>{
    setFocused(false);
    // Ensure formatted final
    setDisplay(formatWithSpaces(unformat(display)));
    props.onBlur?.(e);
  };

  const handleWheel = (e)=>{ e.target.blur(); }; // disable wheel changing
  const handleKeyDown = (e)=>{
    // Allow: backspace, delete, arrows, tab, etc
    props.onKeyDown?.(e);
  };

  return (
    <div className={`group flex flex-col gap-1.5 ${containerClassName}`}>
      {label && <label className="text-[12.5px] font-[550] tracking-[-0.01em] text-muted-foreground group-[.has-error]:text-red-600">{label}</label>}
      <div className={`
        relative flex items-center h-10 rounded-[10px] border bg-background transition-all
        ${focused ? 'border-foreground/20 ring-4 ring-foreground/[0.06] dark:ring-white/[0.08]' : 'border-input hover:border-foreground/20'}
        ${error ? 'border-red-500/60 ring-4 ring-red-500/10 has-error' : ''}
        ${props.disabled ? 'opacity-60 bg-muted' : ''}
      `}>
        {leftIcon && <span className="pl-3 text-muted-foreground text-[13px]">{leftIcon}</span>}
        <input
          ref={(node)=>{ innerRef.current=node; if(typeof ref==='function') ref(node); else if(ref) ref.current=node; }}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          className={`flex-1 h-full w-full bg-transparent px-3 text-[14px] font-[450] tabular-nums placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed ${className}`}
          placeholder={props.placeholder}
          disabled={props.disabled}
          autoComplete="off"
        />
        {rightIcon && <span className="pr-3 text-muted-foreground">{rightIcon}</span>}
      </div>
      {error ? <span className="text-[12px] font-[450] text-red-600 animate-[fadeIn_0.2s]">{error}</span> : hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
});
NumberInput.displayName='NumberInput';
export default NumberInput;

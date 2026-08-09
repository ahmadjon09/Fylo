import { forwardRef, useRef, useState, useEffect, useCallback } from 'react';

/**
 * Fylo Premium NumberInput
 * - 1000 -> 1 000, 1 000 000 with space
 * - Cursor never jumps (digit-count method)
 * - Wheel disabled, paste support, keyboard arrows
 * - Focus shows raw, blur shows formatted? No, formats while typing per requirement
 */

function formatWithSpaces(value) {
  if (value === '' || value === '-' || value === null || value === undefined) return '';
  let str = String(value);
  // Preserve minus and dot handling
  const isNeg = str.startsWith('-');
  if (isNeg) str = str.slice(1);
  
  const parts = str.split('.');
  let intPart = parts[0].replace(/\D/g, '');
  if (intPart === '') intPart = '';
  // Remove leading zeros but keep one if all zeros
  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (intPart) {
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  let result = (isNeg ? '-' : '') + intPart;
  if (parts.length > 1) {
    let dec = parts[1].replace(/[^0-9]/g, '').slice(0, 2);
    result += '.' + dec;
    // If user typed dot but no dec yet, keep dot
    if (parts[1] === '' && str.endsWith('.')) result = (isNeg ? '-' : '') + (intPart || '0') + '.';
  }
  return result;
}

function unformat(value) {
  if (!value) return '';
  return String(value).replace(/\s/g, '');
}

function cleanValue(raw, { allowNegative, allowDecimal }) {
  let cleaned = unformat(raw);
  if (!allowNegative) cleaned = cleaned.replace(/-/g, '');
  if (!allowDecimal) cleaned = cleaned.replace(/\./g, '');

  // Only one dot, one minus at start
  const hasDot = cleaned.includes('.');
  const dotIdx = cleaned.indexOf('.');
  if (hasDot) {
    cleaned = cleaned.slice(0, dotIdx+1) + cleaned.slice(dotIdx+1).replace(/\./g, '');
  }
  if (cleaned.includes('-')) {
    const isNeg = cleaned.startsWith('-');
    cleaned = (isNeg ? '-' : '') + cleaned.replace(/-/g, '');
  }
  // Fix leading zeros: "00" -> "0", "0005" -> "5" but keep "0." 
  if (/^-?0\d/.test(cleaned) && !cleaned.includes('.')) {
    cleaned = cleaned.replace(/^(-?)0+/, '$1');
    if (cleaned === '' || cleaned === '-') cleaned = cleaned.startsWith('-') ? '-0' : '0';
  }
  return cleaned;
}

const NumberInput = forwardRef(({ label, error, hint, value, onValueChange, onChange, defaultValue, className='', containerClassName='', leftIcon, rightIcon, allowNegative=false, allowDecimal=true, ...props }, ref) => {
  const innerRef = useRef(null);
  const [display, setDisplay] = useState(() => formatWithSpaces(value ?? defaultValue ?? ''));
  const [focused, setFocused] = useState(false);

  useEffect(()=>{
    const formatted = formatWithSpaces(value ?? '');
    // Only sync if not focused or external value changed significantly
    if (!focused) {
      setDisplay(formatted);
    } else {
      const currentUnformatted = unformat(display);
      const externalUnformatted = unformat(String(value ?? ''));
      if (currentUnformatted !== externalUnformatted) {
        // If external changed while focused, update but preserve cursor at end
        setDisplay(formatted);
      }
    }
  }, [value]);

  const getDigitsBeforeCursor = (formattedStr, cursorPos) => {
    // Count how many numeric chars (digit, dot, minus) before cursor
    const before = formattedStr.slice(0, cursorPos);
    return unformat(before).length;
  };

  const getCursorFromDigitsCount = (formattedStr, digitsCount) => {
    let count = 0;
    for (let i=0; i<formattedStr.length; i++) {
      if (formattedStr[i] !== ' ') count++;
      if (count >= digitsCount) return i+1;
    }
    return formattedStr.length;
  };

  const handleChange = useCallback((e) => {
    const input = e.target;
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;
    const prevDisplay = display;

    // Digits count before cursor in old formatted value
    const digitsBefore = getDigitsBeforeCursor(prevDisplay, cursor);

    // Clean raw
    let cleaned = cleanValue(raw, { allowNegative, allowDecimal });

    // Format
    const formatted = formatWithSpaces(cleaned);

    // Calculate new cursor: find position where same number of unformatted chars appear
    // Adjust for insertion/deletion at cursor
    let newDigitsBefore = digitsBefore;
    // If raw longer than prev, user inserted; if shorter, deleted
    const rawDiff = raw.length - prevDisplay.length;
    // More accurate: use current raw's digits before cursor
    const currentDigitsBefore = getDigitsBeforeCursor(raw, cursor);
    newDigitsBefore = currentDigitsBefore;

    const newCursor = getCursorFromDigitsCount(formatted, newDigitsBefore);

    setDisplay(formatted);

    requestAnimationFrame(()=>{
      if (innerRef.current) {
        try { innerRef.current.setSelectionRange(newCursor, newCursor); } catch {}
      }
    });

    const numVal = cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.' ? '' : Number(cleaned);
    if (onValueChange) onValueChange(cleaned === '' ? '' : numVal, cleaned);
    if (onChange) onChange({ target: { value: cleaned === '' ? '' : numVal, rawValue: cleaned } });
  }, [display, onValueChange, onChange, allowNegative, allowDecimal]);

  const handleFocus = (e)=>{
    setFocused(true);
    props.onFocus?.(e);
    // Select all? No, place at end for convenience
    setTimeout(()=>{
      if (innerRef.current) {
        const len = innerRef.current.value.length;
        try { innerRef.current.setSelectionRange(len, len); } catch {}
      }
    },0);
  };
  const handleBlur = (e)=>{
    setFocused(false);
    const cleaned = cleanValue(display, { allowNegative, allowDecimal });
    setDisplay(formatWithSpaces(cleaned));
    props.onBlur?.(e);
  };

  return (
    <div className={`group flex flex-col gap-1.5 ${containerClassName}`}>
      {label && <label className="text-[12.5px] font-[550] tracking-[-0.01em] text-muted-foreground group-[.has-error]:text-red-600 flex items-center gap-1">{label} <span className="text-[10px] opacity-60 hidden group-focus-within:inline">←→ Tab Enter Esc</span></label>}
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
          onWheel={(e)=> e.currentTarget.blur()}
          className={`flex-1 h-full w-full bg-transparent px-3 text-[14px] font-[450] tabular-nums placeholder:text-muted-foreground/60 outline-none disabled:cursor-not-allowed ${className}`}
          placeholder={props.placeholder}
          disabled={props.disabled}
          autoComplete="off"
          spellCheck={false}
        />
        {rightIcon && <span className="pr-3 text-muted-foreground">{rightIcon}</span>}
      </div>
      {error ? <span className="text-[12px] font-[450] text-red-600 animate-[fadeIn_0.2s]">{error}</span> : hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
});
NumberInput.displayName='NumberInput';
export default NumberInput;

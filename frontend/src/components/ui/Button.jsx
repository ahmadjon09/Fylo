import { forwardRef } from 'react';
import { FiLoader } from 'react-icons/fi';

const variants = {
  primary: "bg-foreground text-background hover:bg-foreground/90 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost: "bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

const sizes = {
  sm: "h-8 px-3 text-[13px] rounded-[8px] gap-1.5",
  md: "h-9 px-4 text-[13.5px] rounded-[10px] gap-2",
  lg: "h-10 px-5 text-[14px] rounded-[10px] gap-2.5",
  icon: "h-9 w-9 p-0 rounded-[10px]",
};

const Button = forwardRef(({ variant='primary', size='md', loading=false, disabled, className='', children, leftIcon, rightIcon, ...props }, ref) => {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center whitespace-nowrap
        font-[500] tracking-[-0.01em]
        transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        active:scale-[0.98]
        disabled:pointer-events-none disabled:opacity-50
        select-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? <FiLoader className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
Button.displayName = 'Button';
export default Button;

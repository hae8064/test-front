import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4',
  lg: 'h-11 px-8 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    />
  )
);
Button.displayName = 'Button';

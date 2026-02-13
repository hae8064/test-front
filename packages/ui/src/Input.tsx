import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => (
    <input
      ref={ref}
      className={`
        flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm
        placeholder:text-muted-foreground focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed
        disabled:opacity-50
        ${error ? 'border-destructive' : 'border-input'}
        ${className}
      `}
      {...props}
    />
  )
);
Input.displayName = 'Input';

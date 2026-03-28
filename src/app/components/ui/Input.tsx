import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputSize?: 'default' | 'large';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, inputSize = 'default', className = '', ...props }, ref) => {
    const sizeStyles: Record<'default' | 'large', string> = {
      default: 'h-[44px]',
      large: 'h-[50px]',
    };
    
    return (
      <div className="flex flex-col gap-[6px] w-full">
        {label && (
          <label className="text-[14px] font-medium transition-theme" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            ${sizeStyles[inputSize]}
            rounded-[8px]
            px-[14px]
            outline-none
            transition-all
            text-[14px]
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${className}
          `}
          style={{
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border-color)',
          }}
          {...props}
        />
        {error && (
          <span className="text-[12px]" style={{ color: 'var(--danger)' }}>{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

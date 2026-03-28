import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'default' | 'large';
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'default',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-[8px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background-color)] disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'text-white active:scale-[0.99]',
    success: 'text-white active:scale-[0.99]',
    danger: 'text-white active:scale-[0.99]',
    warning: 'active:scale-[0.99]',
    info: 'text-white active:scale-[0.99]',
    ghost:
      'bg-transparent border transition-theme active:scale-[0.99]',
  };

  const sizeStyles = {
    default: 'h-[44px] px-[20px] text-[14px]',
    large: 'h-[50px] px-[28px] text-[16px]',
  };

  const variantColors: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--primary)' },
    success: { backgroundColor: 'var(--primary)' },
    danger: { backgroundColor: 'var(--danger)' },
    warning: { backgroundColor: 'var(--warning)', color: '#1A1A2E' },
    info: { backgroundColor: 'var(--info)' },
    ghost: { borderColor: 'var(--border-color)', color: 'var(--text-primary)' },
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={props.type ?? 'button'}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
      disabled={disabled}
      style={variantColors[variant]}
      {...props}
    >
      {children}
    </button>
  );
}

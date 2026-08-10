import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm border border-transparent',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm border border-transparent',
  outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '', 
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

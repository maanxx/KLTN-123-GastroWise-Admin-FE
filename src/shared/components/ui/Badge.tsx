import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-primary-100 text-primary-700 border-primary-200',
  warning: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

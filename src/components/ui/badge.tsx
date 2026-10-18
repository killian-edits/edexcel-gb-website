import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#0284C7] text-white border-transparent',
    secondary: 'bg-[#F5F5F0] text-[#1A1A1A] border-transparent',
    outline: 'border-[#E5E5E5] text-[#1A1A1A] bg-transparent',
    success: 'bg-[#DCFCE7] text-[#16A34A] border-transparent',
    warning: 'bg-[#FEF3C7] text-[#D97706] border-transparent',
    destructive: 'bg-[#FEE2E2] text-[#DC2626] border-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


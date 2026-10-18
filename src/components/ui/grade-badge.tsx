import React from 'react';
import { cn } from '@/lib/utils';
import type { Grade } from '@/types';

export interface GradeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  grade: Grade | string;
  size?: 'sm' | 'default' | 'lg';
}

export function GradeBadge({ grade, size = 'default', className, ...props }: GradeBadgeProps) {
  const getGradeStyles = (g: string) => {
    switch (g) {
      case 'A*':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';
      case 'A':
        return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      case 'B':
        return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
      case 'C':
        return 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]';
      case 'D':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]';
      case 'E':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      case 'F':
      case 'G':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]';
      case 'U':
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    default: 'text-sm px-3 py-1 font-extrabold',
    lg: 'text-xl px-4 py-1.5 font-black',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border tracking-wider font-mono shadow-2xs',
        getGradeStyles(grade),
        sizes[size],
        className
      )}
      aria-label={`Grade ${grade}`}
      {...props}
    >
      {grade}
    </span>
  );
}


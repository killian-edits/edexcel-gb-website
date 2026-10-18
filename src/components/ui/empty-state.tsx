import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#E5E5E5] bg-white',
        className
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-[#6B6B6B] flex items-center justify-center">{icon}</div>}
      <h4 className="text-base font-semibold text-[#1A1A1A]">{title}</h4>
      <p className="mt-1 text-sm text-[#6B6B6B] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}


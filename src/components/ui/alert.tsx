import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  onDismiss,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-[#0284C7] shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0" aria-hidden="true" />,
    destructive: <AlertCircle className="h-5 w-5 text-[#DC2626] shrink-0" aria-hidden="true" />,
  };

  const variants = {
    info: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]',
    success: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
    warning: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
    destructive: 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex w-full gap-3 rounded-lg border p-4 text-sm transition-all',
        variants[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto inline-flex text-current hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}


import React from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

export function Alert({ variant = 'info', children, className = '', onDismiss }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-md border p-4 text-sm ${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>{children}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 inline-flex shrink-0 rounded p-1 hover:opacity-70 focus:outline-none focus:ring-2"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

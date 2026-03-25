type BadgeVariant = 'green' | 'red' | 'amber' | 'gray' | 'blue';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Map consent state to badge variant. */
export function consentBadgeVariant(state: string): BadgeVariant {
  switch (state) {
    case 'allowed':
      return 'green';
    case 'denied':
      return 'red';
    case 'mixed':
      return 'amber';
    default:
      return 'gray';
  }
}

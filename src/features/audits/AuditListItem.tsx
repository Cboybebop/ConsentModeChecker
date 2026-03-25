import { Badge } from '../../components/ui/Badge';

interface AuditListItemProps {
  siteName: string;
  siteUrl: string;
  date: string;
  qualityIndex: number;
  onClick: () => void;
}

function statusVariant(qi: number): 'green' | 'amber' | 'red' {
  if (qi >= 80) return 'green';
  if (qi >= 50) return 'amber';
  return 'red';
}

export function AuditListItem({ siteName, siteUrl, date, qualityIndex, onClick }: AuditListItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/70 dark:hover:bg-gray-800/70"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">{siteName || siteUrl}</p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-300">{siteUrl}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(date).toLocaleDateString()}</p>
      </div>
      <Badge variant={statusVariant(qualityIndex)} className="ml-4 shrink-0">
        {qualityIndex}/100
      </Badge>
    </button>
  );
}

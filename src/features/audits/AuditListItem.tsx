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
      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{siteName || siteUrl}</p>
        <p className="truncate text-sm text-gray-500">{siteUrl}</p>
        <p className="text-xs text-gray-400">{new Date(date).toLocaleDateString()}</p>
      </div>
      <Badge variant={statusVariant(qualityIndex)} className="ml-4 shrink-0">
        {qualityIndex}/100
      </Badge>
    </button>
  );
}

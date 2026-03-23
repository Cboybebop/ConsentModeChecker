import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AuditDiffView } from './AuditDiffView';

interface AuditData {
  id: string;
  site_url: string;
  site_name: string | null;
  quality_index: number;
  summary: string | null;
  decoded: Record<string, unknown>;
  created_at: string;
}

interface AuditDetailProps {
  audit: AuditData;
  previousAudit?: AuditData;
  onBack: () => void;
}

function qiBadgeVariant(qi: number): 'green' | 'amber' | 'red' {
  if (qi >= 80) return 'green';
  if (qi >= 50) return 'amber';
  return 'red';
}

export function AuditDetail({ audit, previousAudit, onBack }: AuditDetailProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        ← Back to list
      </Button>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{audit.site_name || audit.site_url}</h2>
            <p className="text-sm text-gray-500">{audit.site_url}</p>
            <p className="text-xs text-gray-400">{new Date(audit.created_at).toLocaleString()}</p>
          </div>
          <Badge variant={qiBadgeVariant(audit.quality_index)} className="text-base">
            {audit.quality_index}/100
          </Badge>
        </div>

        {audit.summary && (
          <p className="mb-4 text-sm text-gray-700">{audit.summary}</p>
        )}

        {previousAudit && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <AuditDiffView
              currentDecoded={audit.decoded}
              previousDecoded={previousAudit.decoded}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

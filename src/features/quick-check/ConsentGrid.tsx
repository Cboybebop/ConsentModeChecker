import type { SignalResult } from '../../lib/consentDecoders';
import { Card } from '../../components/ui/Card';
import { Badge, consentBadgeVariant } from '../../components/ui/Badge';
import { Tooltip } from '../../components/ui/Tooltip';
import { BADGE_LABELS, TOOLTIPS } from '../../constants/text';

interface ConsentGridProps {
  signals: SignalResult[];
}

export function ConsentGrid({ signals }: ConsentGridProps) {
  if (signals.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {signals.map((signal) => (
        <Card key={signal.name}>
          <div className="mb-2 flex items-center justify-between">
            <Tooltip content={TOOLTIPS[signal.name] ?? ''}>
              <span className="font-medium text-gray-900">{signal.displayName}</span>
            </Tooltip>
            <Badge variant={consentBadgeVariant(signal.state)}>
              {BADGE_LABELS[signal.state] ?? 'Unknown'}
            </Badge>
          </div>
          <p className="mb-1 text-sm font-medium text-gray-700">{signal.statusLabel}</p>
          <p className="text-sm text-gray-500">{signal.implication}</p>
        </Card>
      ))}
    </div>
  );
}

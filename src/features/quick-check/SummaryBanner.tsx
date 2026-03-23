import type { OverallStatus } from '../../lib/consentDecoders';
import { STATUS_LABELS, STATUS_DESCRIPTIONS } from '../../constants/text';

interface SummaryBannerProps {
  status: OverallStatus;
  summary?: string;
}

const statusColors: Record<OverallStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  incomplete: 'bg-amber-100 text-amber-800 border-amber-300',
  missing: 'bg-red-100 text-red-800 border-red-300',
};

const statusEmoji: Record<OverallStatus, string> = {
  active: '🟢',
  incomplete: '🟡',
  missing: '🔴',
};

export function SummaryBanner({ status, summary }: SummaryBannerProps) {
  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{statusEmoji[status]}</span>
        <span className="text-lg font-semibold">{STATUS_LABELS[status]}</span>
      </div>
      <p className="mt-1 text-sm">
        {summary ?? STATUS_DESCRIPTIONS[status]}
      </p>
    </div>
  );
}

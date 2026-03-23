import type { DecodeResult } from '../../lib/consentDecoders';
import { Badge, consentBadgeVariant } from '../../components/ui/Badge';
import { BADGE_LABELS } from '../../constants/text';

interface ComparisonGridProps {
  acceptResult: DecodeResult;
  rejectResult: DecodeResult;
}

export function ComparisonGrid({ acceptResult, rejectResult }: ComparisonGridProps) {
  // Merge signal names from both results
  const allNames = Array.from(
    new Set([
      ...acceptResult.signals.map((s) => s.name),
      ...rejectResult.signals.map((s) => s.name),
    ]),
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Signal
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              After Accept
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              After Reject
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Changed?
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {allNames.map((name) => {
            const accept = acceptResult.signals.find((s) => s.name === name);
            const reject = rejectResult.signals.find((s) => s.name === name);
            const changed = accept?.state !== reject?.state;
            const displayName = accept?.displayName ?? reject?.displayName ?? name;

            return (
              <tr key={name} className={changed ? 'bg-amber-50' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{displayName}</td>
                <td className="px-4 py-3">
                  {accept ? (
                    <Badge variant={consentBadgeVariant(accept.state)}>
                      {BADGE_LABELS[accept.state] ?? 'Unknown'}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {reject ? (
                    <Badge variant={consentBadgeVariant(reject.state)}>
                      {BADGE_LABELS[reject.state] ?? 'Unknown'}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {changed ? (
                    <span className="font-medium text-amber-700">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

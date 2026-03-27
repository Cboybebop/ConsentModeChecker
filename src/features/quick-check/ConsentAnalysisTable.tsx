import type { SignalResult, LifecycleState } from '../../lib/consentDecoders';

interface ConsentAnalysisTableProps {
  signals: SignalResult[];
}

const LIFECYCLE_COLUMNS = ['implicit', 'declare', 'default', 'update'] as const;

const COLUMN_LABELS: Record<(typeof LIFECYCLE_COLUMNS)[number], string> = {
  implicit: 'Implicit',
  declare: 'Declare',
  default: 'Default',
  update: 'Update',
};

function StateBadge({ state }: { state: LifecycleState }) {
  if (state === 'granted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        granted
      </span>
    );
  }

  if (state === 'denied') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round" />
        </svg>
        denied
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400">
      -
    </span>
  );
}

export function ConsentAnalysisTable({ signals }: ConsentAnalysisTableProps) {
  const hasBreakdown = signals.some((s) => s.breakdown);
  if (!hasBreakdown || signals.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Google Consent Mode Analysis</h3>
        <p className="text-sm text-gray-400">Complete breakdown of your consent string</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="rounded-t-lg bg-gray-800/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Consent Type
              </th>
              {LIFECYCLE_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-cyan-400"
                >
                  {COLUMN_LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {signals.map((signal) => {
              const breakdown = signal.breakdown;
              return (
                <tr key={signal.name} className="bg-gray-800/30">
                  <td className="px-4 py-3 text-sm font-medium text-cyan-300">
                    {signal.name}
                  </td>
                  {LIFECYCLE_COLUMNS.map((col) => (
                    <td key={col} className="px-4 py-3 text-center">
                      <StateBadge state={breakdown?.[col] ?? 'unset'} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

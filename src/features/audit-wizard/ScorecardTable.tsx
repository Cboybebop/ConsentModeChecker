import type { ScorecardRow } from '../../lib/scoring';

interface ScorecardTableProps {
  rows: ScorecardRow[];
}

const statusIcon: Record<ScorecardRow['status'], string> = {
  pass: '🟢',
  warn: '🟡',
  fail: '🔴',
};

export function ScorecardTable({ rows }: ScorecardTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Area
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
              Explanation
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/70">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.area}</td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                <span className="mr-1">{statusIcon[row.status]}</span>
                {row.statusLabel}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.explanation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

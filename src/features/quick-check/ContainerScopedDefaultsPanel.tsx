import type { ContainerScopedDefaults } from '../../lib/consentDecoders';
import { GCD_METADATA } from '../../constants/text';

interface ContainerScopedDefaultsPanelProps {
  data: ContainerScopedDefaults;
}

function boolDisplay(value: boolean | null): string {
  if (value === true) return 'True';
  if (value === false) return 'False';
  return 'N/A';
}

function ValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/40 bg-gradient-to-br from-gray-800/80 to-gray-800/60 p-4">
      <p className="mb-1 text-xs font-medium text-emerald-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export function ContainerScopedDefaultsPanel({ data }: ContainerScopedDefaultsPanelProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-100">
          {GCD_METADATA.containerScopedTitle}
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ValueCard label={GCD_METADATA.adStorage} value={boolDisplay(data.adStorage)} />
        <ValueCard label={GCD_METADATA.analyticsStorage} value={boolDisplay(data.analyticsStorage)} />
        <ValueCard label={GCD_METADATA.adUserData} value={boolDisplay(data.adUserData)} />
        <ValueCard label={GCD_METADATA.adPersonalization} value={boolDisplay(data.adPersonalization)} />
        <ValueCard
          label={GCD_METADATA.usedContainerScopedDefaults}
          value={boolDisplay(data.usedContainerScopedDefaults)}
        />
      </div>
    </div>
  );
}

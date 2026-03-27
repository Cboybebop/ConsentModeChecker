import type { GlobalPrivacyControls, TriState } from '../../lib/consentDecoders';
import { GCD_METADATA } from '../../constants/text';

interface GlobalPrivacyPanelProps {
  data: GlobalPrivacyControls;
}

function triStateDisplay(value: TriState): string {
  if (value === 'yes') return 'Yes';
  if (value === 'no') return 'No';
  return 'N/A';
}

type CardVariant = 'green' | 'purple' | 'pink';

function MetadataCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: CardVariant;
}) {
  const variantStyles: Record<CardVariant, { card: string; label: string }> = {
    green: {
      card: 'border-emerald-500/40 bg-gradient-to-br from-gray-800/80 to-gray-800/60',
      label: 'text-emerald-400',
    },
    purple: {
      card: 'border-purple-500/40 bg-gradient-to-br from-indigo-900/40 to-purple-900/30',
      label: 'text-purple-400',
    },
    pink: {
      card: 'border-pink-500/40 bg-gradient-to-br from-purple-900/30 to-pink-900/30',
      label: 'text-pink-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`rounded-lg border p-4 ${styles.card}`}>
      <p className={`mb-1 text-xs font-medium ${styles.label}`}>{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}

export function GlobalPrivacyPanel({ data }: GlobalPrivacyPanelProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-100">
          {GCD_METADATA.globalPrivacyTitle}
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetadataCard
          label={GCD_METADATA.usPrivacyLawsOptedIn}
          value={triStateDisplay(data.usPrivacyLawsOptedIn)}
          variant="green"
        />
        <MetadataCard
          label={GCD_METADATA.usedContainerDefaults}
          value={triStateDisplay(data.usedContainerDefaults)}
          variant="purple"
        />
        <MetadataCard
          label={GCD_METADATA.adPersonalizationSignals}
          value={triStateDisplay(data.adPersonalizationSignals)}
          variant="pink"
        />
      </div>
    </div>
  );
}

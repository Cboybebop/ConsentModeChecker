import type { SignalResult } from '../../lib/consentDecoders';

interface NextStepsPanelProps {
  signals: SignalResult[];
}

function generateRecommendations(signals: SignalResult[]): string[] {
  const recs: string[] = [];

  for (const s of signals) {
    if (s.state === 'unknown') {
      recs.push(
        `${s.displayName} could not be detected — check that your Consent Mode implementation covers this signal.`,
      );
    }
    if (s.name === 'ad_personalization' && s.state === 'allowed') {
      recs.push(
        'Ad personalisation is still active when users reject — ask your cookie banner provider to check this.',
      );
    }
    if (s.name === 'ad_storage' && s.state === 'allowed') {
      recs.push(
        'Ad storage is currently allowed. If this is after a user rejects cookies, this is a compliance risk.',
      );
    }
  }

  if (recs.length === 0 && signals.every((s) => s.state === 'allowed')) {
    recs.push(
      'All signals are allowed. If this is after accepting cookies, this looks correct. Make sure signals are denied after rejecting.',
    );
  }

  if (recs.length === 0) {
    recs.push(
      'No immediate issues found. Consider running a full Guided Audit for a complete check.',
    );
  }

  return recs;
}

export function NextStepsPanel({ signals }: NextStepsPanelProps) {
  const recommendations = generateRecommendations(signals);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Recommended next steps
      </h3>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span
              className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600"
              aria-hidden="true"
            />
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}

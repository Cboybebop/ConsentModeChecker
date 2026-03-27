import type { DecodeResult } from '../../../lib/consentDecoders';
import type { ScoreResult } from '../../../lib/scoring';
import { scoreAudit } from '../../../lib/scoring';
import { ScorecardTable } from '../ScorecardTable';
import { QualityGauge } from '../QualityGauge';
import { GlobalPrivacyPanel } from '../../quick-check/GlobalPrivacyPanel';
import { ContainerScopedDefaultsPanel } from '../../quick-check/ContainerScopedDefaultsPanel';
import { Button } from '../../../components/ui/Button';
import { WIZARD } from '../../../constants/text';

interface Step4Props {
  beforeBanner: boolean;
  acceptResult: DecodeResult | null;
  rejectResult: DecodeResult | null;
  onSave: (score: ScoreResult) => void;
  onPrint: () => void;
  saving: boolean;
}

const emptyDecode: DecodeResult = {
  inputType: 'unknown',
  overallStatus: 'missing',
  overallSummary: '',
  signals: [],
  rawInput: '',
};

export function Step4Summary({
  beforeBanner,
  acceptResult,
  rejectResult,
  onSave,
  onPrint,
  saving,
}: Step4Props) {
  const result: ScoreResult = scoreAudit({
    beforeBanner,
    afterAccept: acceptResult ?? emptyDecode,
    afterReject: rejectResult ?? emptyDecode,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {WIZARD.step4Title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{WIZARD.step4Description}</p>
      </div>

      <QualityGauge value={result.qualityIndex} />
      <ScorecardTable rows={result.scorecard} />

      {(acceptResult?.globalPrivacyControls || rejectResult?.globalPrivacyControls) && (
        <GlobalPrivacyPanel
          data={(acceptResult?.globalPrivacyControls ?? rejectResult?.globalPrivacyControls)!}
        />
      )}
      {(acceptResult?.containerScopedDefaults || rejectResult?.containerScopedDefaults) && (
        <ContainerScopedDefaultsPanel
          data={(acceptResult?.containerScopedDefaults ?? rejectResult?.containerScopedDefaults)!}
        />
      )}

      {result.recommendations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <span
                  className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600"
                  aria-hidden="true"
                />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onPrint}>
          Download PDF summary
        </Button>
        <Button onClick={() => onSave(result)} loading={saving}>
          Save audit
        </Button>
      </div>
    </div>
  );
}

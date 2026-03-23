import { useState, useRef } from 'react';
import type { DecodeResult } from '../../lib/consentDecoders';
import type { ScoreResult } from '../../lib/scoring';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Step1SiteDetails } from './steps/Step1SiteDetails';
import { Step2AfterAccept } from './steps/Step2AfterAccept';
import { Step3AfterReject } from './steps/Step3AfterReject';
import { Step4Summary } from './steps/Step4Summary';
import { PrintSummary } from './PrintSummary';
import { useAuth } from '../auth/useAuth';
import { supabaseEnabled } from '../../lib/supabaseClient';
import { useLocalAudits } from '../../hooks/useLocalAudits';
import { useSupabaseAudits } from '../../hooks/useSupabaseAudits';

const TOTAL_STEPS = 4;

export function AuditWizardPage() {
  const { user } = useAuth();
  const localAudits = useLocalAudits();
  const supabaseAudits = useSupabaseAudits();
  const printRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [bannerChoice, setBannerChoice] = useState<'yes' | 'no' | 'unsure' | null>(null);
  const [acceptInput, setAcceptInput] = useState('');
  const [rejectInput, setRejectInput] = useState('');
  const [acceptResult, setAcceptResult] = useState<DecodeResult | null>(null);
  const [rejectResult, setRejectResult] = useState<DecodeResult | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const beforeBanner = bannerChoice === 'yes';

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return siteUrl.trim().length > 0 && bannerChoice !== null;
      case 2:
        return acceptInput.trim().length > 0;
      case 3:
        return rejectInput.trim().length > 0;
      default:
        return false;
    }
  };

  const handleSave = async (result: ScoreResult) => {
    setScoreResult(result);
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        site_url: siteUrl.trim(),
        site_name: siteName.trim() || siteUrl.trim(),
        quality_index: result.qualityIndex,
        summary: result.scorecard.map((r) => `${r.area}: ${r.statusLabel}`).join('; '),
        raw_input: { acceptInput, rejectInput } as Record<string, unknown>,
        decoded: {
          acceptResult: acceptResult as unknown as Record<string, unknown>,
          rejectResult: rejectResult as unknown as Record<string, unknown>,
          scoreResult: result as unknown as Record<string, unknown>,
        } as Record<string, unknown>,
      };

      if (supabaseEnabled && user) {
        await supabaseAudits.saveAudit(payload);
      } else {
        localAudits.saveAudit(payload);
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save audit.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Guided Audit</h1>
      <p className="mb-6 text-gray-600">
        Walk through a 4-step audit to get a full compliance report for your site.
      </p>

      <ProgressBar current={step} total={TOTAL_STEPS} className="mb-8" />

      {saveError && <Alert variant="error" className="mb-4">{saveError}</Alert>}
      {saved && <Alert variant="success" className="mb-4">Audit saved successfully.</Alert>}

      {step === 1 && (
        <Step1SiteDetails
          siteUrl={siteUrl}
          setSiteUrl={setSiteUrl}
          siteName={siteName}
          setSiteName={setSiteName}
          bannerChoice={bannerChoice}
          setBannerChoice={setBannerChoice}
        />
      )}
      {step === 2 && (
        <Step2AfterAccept
          acceptInput={acceptInput}
          setAcceptInput={setAcceptInput}
          setAcceptResult={setAcceptResult}
        />
      )}
      {step === 3 && (
        <Step3AfterReject
          rejectInput={rejectInput}
          setRejectInput={setRejectInput}
          setRejectResult={setRejectResult}
          acceptResult={acceptResult}
        />
      )}
      {step === 4 && (
        <Step4Summary
          beforeBanner={beforeBanner}
          acceptResult={acceptResult}
          rejectResult={rejectResult}
          onSave={handleSave}
          onPrint={handlePrint}
          saving={saving}
        />
      )}

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}
        {step < TOTAL_STEPS && (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Next
          </Button>
        )}
      </div>

      <PrintSummary
        ref={printRef}
        siteUrl={siteUrl}
        siteName={siteName}
        scoreResult={scoreResult}
        acceptResult={acceptResult}
        rejectResult={rejectResult}
      />
    </div>
  );
}

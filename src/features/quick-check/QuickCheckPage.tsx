import { useState } from 'react';
import { decode } from '../../lib/consentDecoders';
import type { DecodeResult } from '../../lib/consentDecoders';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { QUICK_CHECK } from '../../constants/text';
import { SummaryBanner } from './SummaryBanner';
import { ConsentGrid } from './ConsentGrid';
import { NextStepsPanel } from './NextStepsPanel';
import { HowToFindCode } from './HowToFindCode';
import { useAuth } from '../auth/useAuth';
import { supabaseEnabled } from '../../lib/supabaseClient';
import { useLocalAudits } from '../../hooks/useLocalAudits';
import { useSupabaseAudits } from '../../hooks/useSupabaseAudits';

export function QuickCheckPage() {
  const { user } = useAuth();
  const localAudits = useLocalAudits();
  const supabaseAudits = useSupabaseAudits();
  const [gcsInput, setGcsInput] = useState('');
  const [gcdInput, setGcdInput] = useState('');
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Save-as-audit modal state
  const [saveOpen, setSaveOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAnalyse = (input: string) => {
    const decoded = decode(input);
    setResult(decoded);
  };

  const handleSave = async () => {
    if (!siteUrl.trim()) {
      setSaveError('Site URL is required.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        site_url: siteUrl.trim(),
        site_name: siteName.trim() || siteUrl.trim(),
        quality_index: 0,
        summary: result?.overallSummary ?? '',
        raw_input: { value: result?.rawInput ?? '' } as Record<string, unknown>,
        decoded: (result as unknown as Record<string, unknown>) ?? {},
      };

      if (supabaseEnabled && user) {
        await supabaseAudits.saveAudit(payload);
      } else {
        localAudits.saveAudit(payload);
      }
      setSaveOpen(false);
      setSiteName('');
      setSiteUrl('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save audit.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: 'gcs',
      label: QUICK_CHECK.tabGcs,
      content: (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder={QUICK_CHECK.placeholderGcs}
            value={gcsInput}
            onChange={(e) => setGcsInput(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <Button onClick={() => handleAnalyse(gcsInput)} disabled={!gcsInput.trim()}>
            {QUICK_CHECK.analyseButton}
          </Button>
        </div>
      ),
    },
    {
      id: 'gcd',
      label: QUICK_CHECK.tabGcd,
      content: (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder={QUICK_CHECK.placeholderGcd}
            value={gcdInput}
            onChange={(e) => setGcdInput(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <Button onClick={() => handleAnalyse(gcdInput)} disabled={!gcdInput.trim()}>
            {QUICK_CHECK.analyseButton}
          </Button>
        </div>
      ),
    },
    {
      id: 'help',
      label: QUICK_CHECK.tabHelp,
      content: (
        <div>
          <Button variant="secondary" onClick={() => setHelpOpen(true)}>
            Open step-by-step guide
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Quick Check</h1>
      <p className="mb-6 text-gray-600">
        Paste a single GCS or GCD value to instantly see your Consent Mode status.
      </p>

      <Tabs tabs={tabs} />

      {result && (
        <div className="mt-8 space-y-6">
          {result.inputType === 'unknown' ? (
            <Alert variant="warning">{QUICK_CHECK.errorUnrecognised}</Alert>
          ) : (
            <>
              <SummaryBanner status={result.overallStatus} summary={result.overallSummary} />
              <ConsentGrid signals={result.signals} />
              <NextStepsPanel signals={result.signals} />
              <div>
                <Button variant="secondary" onClick={() => setSaveOpen(true)}>
                  Save as audit
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="How to find your code">
        <HowToFindCode />
      </Modal>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Save as audit">
        <div className="space-y-4">
          {saveError && <Alert variant="error">{saveError}</Alert>}
          <div>
            <label htmlFor="save-site-name" className="block text-sm font-medium text-gray-700">
              Site name (optional)
            </label>
            <input
              id="save-site-name"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="save-site-url" className="block text-sm font-medium text-gray-700">
              Site URL
            </label>
            <input
              id="save-site-url"
              type="url"
              required
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

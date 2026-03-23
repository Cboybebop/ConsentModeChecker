import { useEffect, useState } from 'react';
import { decode } from '../../../lib/consentDecoders';
import type { DecodeResult } from '../../../lib/consentDecoders';
import { ComparisonGrid } from '../ComparisonGrid';
import { WIZARD } from '../../../constants/text';

interface Step3Props {
  rejectInput: string;
  setRejectInput: (v: string) => void;
  setRejectResult: (r: DecodeResult | null) => void;
  acceptResult: DecodeResult | null;
}

export function Step3AfterReject({
  rejectInput, setRejectInput, setRejectResult, acceptResult,
}: Step3Props) {
  const [result, setResult] = useState<DecodeResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rejectInput.trim()) {
        const decoded = decode(rejectInput);
        setResult(decoded);
        setRejectResult(decoded);
      } else {
        setResult(null);
        setRejectResult(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rejectInput, setRejectResult]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{WIZARD.step3Title}</h2>
        <p className="text-sm text-gray-600">{WIZARD.step3Description}</p>
      </div>

      <textarea
        rows={4}
        value={rejectInput}
        onChange={(e) => setRejectInput(e.target.value)}
        placeholder="Paste your GCS or GCD value here…"
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      {acceptResult && result && result.inputType !== 'unknown' && (
        <ComparisonGrid acceptResult={acceptResult} rejectResult={result} />
      )}
    </div>
  );
}

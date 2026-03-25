import { useEffect, useState } from 'react';
import { decode } from '../../../lib/consentDecoders';
import type { DecodeResult } from '../../../lib/consentDecoders';
import { ConsentGrid } from '../../quick-check/ConsentGrid';
import { WIZARD } from '../../../constants/text';

interface Step2Props {
  acceptInput: string;
  setAcceptInput: (v: string) => void;
  setAcceptResult: (r: DecodeResult | null) => void;
}

export function Step2AfterAccept({ acceptInput, setAcceptInput, setAcceptResult }: Step2Props) {
  const [result, setResult] = useState<DecodeResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (acceptInput.trim()) {
        const decoded = decode(acceptInput);
        setResult(decoded);
        setAcceptResult(decoded);
      } else {
        setResult(null);
        setAcceptResult(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [acceptInput, setAcceptResult]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {WIZARD.step2Title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{WIZARD.step2Description}</p>
      </div>

      <textarea
        rows={4}
        value={acceptInput}
        onChange={(e) => setAcceptInput(e.target.value)}
        placeholder="Paste your GCS or GCD value here…"
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      {result && result.inputType !== 'unknown' && <ConsentGrid signals={result.signals} />}
    </div>
  );
}

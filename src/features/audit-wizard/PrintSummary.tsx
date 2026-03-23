import React from 'react';
import type { ScoreResult } from '../../lib/scoring';
import type { DecodeResult } from '../../lib/consentDecoders';
import { APP_NAME } from '../../constants/text';

interface PrintSummaryProps {
  siteUrl: string;
  siteName: string;
  scoreResult: ScoreResult | null;
  acceptResult: DecodeResult | null;
  rejectResult: DecodeResult | null;
}

export const PrintSummary = React.forwardRef<HTMLDivElement, PrintSummaryProps>(
  ({ siteUrl, siteName, scoreResult, acceptResult, rejectResult }, ref) => {
    return (
      <div ref={ref} className="hidden print:block p-8 text-sm">
        <h1 className="mb-1 text-xl font-bold">{APP_NAME} — Audit Report</h1>
        <p className="mb-4 text-gray-600">
          {siteName || siteUrl} — {new Date().toLocaleDateString()}
        </p>

        {scoreResult && (
          <>
            <h2 className="mb-2 text-lg font-semibold">
              Quality Index: {scoreResult.qualityIndex}/100
            </h2>

            <table className="mb-6 w-full border-collapse text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-1 text-left">Area</th>
                  <th className="py-1 text-left">Status</th>
                  <th className="py-1 text-left">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {scoreResult.scorecard.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1">{row.area}</td>
                    <td className="py-1">{row.statusLabel}</td>
                    <td className="py-1">{row.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {scoreResult.recommendations.length > 0 && (
              <>
                <h3 className="mb-1 font-semibold">Recommendations</h3>
                <ul className="mb-4 list-disc pl-5">
                  {scoreResult.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {acceptResult && (
          <>
            <h3 className="mb-1 font-semibold">After Accept signals</h3>
            <ul className="mb-4 list-disc pl-5">
              {acceptResult.signals.map((s) => (
                <li key={s.name}>
                  {s.displayName}: {s.state} ({s.statusLabel})
                </li>
              ))}
            </ul>
          </>
        )}

        {rejectResult && (
          <>
            <h3 className="mb-1 font-semibold">After Reject signals</h3>
            <ul className="mb-4 list-disc pl-5">
              {rejectResult.signals.map((s) => (
                <li key={s.name}>
                  {s.displayName}: {s.state} ({s.statusLabel})
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  },
);

PrintSummary.displayName = 'PrintSummary';

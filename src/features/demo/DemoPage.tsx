import { SummaryBanner } from '../quick-check/SummaryBanner';
import { ConsentGrid } from '../quick-check/ConsentGrid';
import { ScorecardTable } from '../audit-wizard/ScorecardTable';
import { QualityGauge } from '../audit-wizard/QualityGauge';
import {
  goodAccept, goodScore,
  mixedAccept, mixedScore,
  badAccept, badScore,
} from './DemoData';

export function DemoPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 space-y-12">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Demo Results</h1>
        <p className="mb-8 text-gray-600">
          Preview how the tool displays results — no real codes needed.
        </p>
      </div>

      {/* Good scenario */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Good Implementation</h2>
        <div className="space-y-4">
          <SummaryBanner status={goodAccept.overallStatus} />
          <ConsentGrid signals={goodAccept.signals} />
          <QualityGauge value={goodScore.qualityIndex} />
          <ScorecardTable rows={goodScore.scorecard} />
        </div>
      </section>

      {/* Mixed scenario */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Partial Issues</h2>
        <div className="space-y-4">
          <SummaryBanner status={mixedAccept.overallStatus} />
          <ConsentGrid signals={mixedAccept.signals} />
          <QualityGauge value={mixedScore.qualityIndex} />
          <ScorecardTable rows={mixedScore.scorecard} />
        </div>
      </section>

      {/* Bad scenario */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Poor Implementation</h2>
        <div className="space-y-4">
          <SummaryBanner status={badAccept.overallStatus} />
          <ConsentGrid signals={badAccept.signals} />
          <QualityGauge value={badScore.qualityIndex} />
          <ScorecardTable rows={badScore.scorecard} />
        </div>
      </section>
    </div>
  );
}

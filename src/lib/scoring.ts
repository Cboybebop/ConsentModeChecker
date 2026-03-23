// Deterministic scoring module — pure TypeScript, no side effects.

import type { DecodeResult, SignalResult } from './consentDecoders';

export interface AuditInput {
  beforeBanner: boolean;
  afterAccept: DecodeResult;
  afterReject: DecodeResult;
}

export interface ScorecardRow {
  area: string;
  status: 'pass' | 'warn' | 'fail';
  statusLabel: string;
  explanation: string;
}

export interface ScoreResult {
  qualityIndex: number;
  scorecard: ScorecardRow[];
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findSignal(result: DecodeResult, name: string): SignalResult | undefined {
  return result.signals.find((s) => s.name === name);
}

function hasUpdateSource(result: DecodeResult): boolean {
  return result.signals.length > 0 && result.signals.every((s) => s.source === 'update');
}

// ---------------------------------------------------------------------------
// Scoring rules
// ---------------------------------------------------------------------------
// Each rule is documented inline. Points are summed and capped 0–100.
//
// | Condition                                            | Points |
// |------------------------------------------------------|--------|
// | Banner fires before Google tags                      | +10    |
// | analytics_storage denied by default (reject)         | +10    |
// | analytics_storage allowed after accept               | +10    |
// | analytics_storage denied after reject                | +15    |
// | ad_storage denied by default (reject)                | +10    |
// | ad_storage denied after reject                       | +15    |
// | ad_user_data denied after reject                     | +10    |
// | ad_personalization denied after reject               | +10    |
// | All signals use update source (not just default)     | +10    |
// | ad_storage allowed after reject                      | -20    |
// | ad_personalization allowed after reject              | -20    |
// | No signals detected at all                           | 0 total|

export function scoreAudit(input: AuditInput): ScoreResult {
  const { beforeBanner, afterAccept, afterReject } = input;
  const scorecard: ScorecardRow[] = [];
  const recommendations: string[] = [];
  let points = 0;

  // If no signals detected at all, return zero
  if (afterAccept.signals.length === 0 && afterReject.signals.length === 0) {
    return {
      qualityIndex: 0,
      scorecard: [
        {
          area: 'Consent Mode Detection',
          status: 'fail',
          statusLabel: 'Not detected',
          explanation:
            'No Consent Mode signals were found. Google Consent Mode may not be implemented on this site.',
        },
      ],
      recommendations: [
        'Implement Google Consent Mode v2 on your site — contact your developer or tag management provider.',
      ],
    };
  }

  // Rule 1: Banner fires before Google tags (+10)
  if (beforeBanner) {
    points += 10;
    scorecard.push({
      area: 'Privacy & Consent compliance',
      status: 'pass',
      statusLabel: 'Banner loads first',
      explanation: 'Your consent banner fires before Google tags, which is the correct setup.',
    });
  } else {
    scorecard.push({
      area: 'Privacy & Consent compliance',
      status: 'fail',
      statusLabel: 'Banner timing issue',
      explanation:
        'Your consent banner may not fire before Google tags load. This could mean data is collected before consent is given.',
    });
    recommendations.push(
      'Ensure your consent banner loads and sets default consent states before any Google tags fire.',
    );
  }

  // Rule 2: analytics_storage denied by default (+10)
  const analyticsReject = findSignal(afterReject, 'analytics_storage');
  if (analyticsReject?.state === 'denied') {
    points += 10;
  } else {
    recommendations.push(
      'Set analytics_storage to "denied" by default so analytics cookies are blocked until the user consents.',
    );
  }

  // Rule 3: analytics_storage allowed after accept (+10)
  const analyticsAccept = findSignal(afterAccept, 'analytics_storage');
  if (analyticsAccept?.state === 'allowed') {
    points += 10;
    scorecard.push({
      area: 'Google Analytics tracking',
      status: 'pass',
      statusLabel: 'Working correctly',
      explanation:
        'Analytics storage is enabled after the user accepts cookies, allowing full measurement.',
    });
  } else {
    scorecard.push({
      area: 'Google Analytics tracking',
      status: 'warn',
      statusLabel: 'Not enabled after accept',
      explanation:
        'Analytics storage does not appear to be enabled after the user accepts. You may be losing measurement data.',
    });
    recommendations.push(
      'Check that analytics_storage is updated to "granted" when users accept cookies.',
    );
  }

  // Rule 4: analytics_storage denied after reject (+15)
  if (analyticsReject?.state === 'denied') {
    points += 15;
  } else {
    scorecard.push({
      area: 'Google Analytics tracking',
      status: analyticsAccept?.state === 'allowed' ? 'warn' : 'fail',
      statusLabel: 'Still active after reject',
      explanation:
        'Analytics storage remains active even when the user rejects cookies. This is a compliance risk.',
    });
    recommendations.push(
      'Make sure analytics_storage is set to "denied" when users reject cookies.',
    );
  }

  // Rule 5: ad_storage denied by default (+10)
  const adReject = findSignal(afterReject, 'ad_storage');
  if (adReject?.state === 'denied') {
    points += 10;
  } else {
    recommendations.push(
      'Set ad_storage to "denied" by default so advertising cookies are blocked until consent is given.',
    );
  }

  // Rule 6: ad_storage denied after reject (+15)
  const adAccept = findSignal(afterAccept, 'ad_storage');
  if (adReject?.state === 'denied') {
    points += 15;
    scorecard.push({
      area: 'Google Ads tracking',
      status: 'pass',
      statusLabel: 'Correctly restricted',
      explanation:
        'Ad storage is denied after the user rejects, which is the compliant behaviour.',
    });
  } else {
    scorecard.push({
      area: 'Google Ads tracking',
      status: 'fail',
      statusLabel: 'Active after reject',
      explanation:
        'Ad storage is still active after the user rejects cookies. This is a significant compliance risk.',
    });
  }

  // Rule 7: ad_user_data denied after reject (+10)
  const adUserDataReject = findSignal(afterReject, 'ad_user_data');
  if (adUserDataReject?.state === 'denied') {
    points += 10;
  } else {
    recommendations.push(
      'Ensure ad_user_data is set to "denied" when users reject cookies to prevent user data being sent to Google for ads.',
    );
  }

  // Rule 8: ad_personalization denied after reject (+10)
  const adPersoReject = findSignal(afterReject, 'ad_personalization');
  if (adPersoReject?.state === 'denied') {
    points += 10;
    scorecard.push({
      area: 'Ad personalisation',
      status: 'pass',
      statusLabel: 'Correctly disabled',
      explanation:
        'Ad personalisation is disabled when the user rejects, preventing targeted advertising.',
    });
  } else {
    scorecard.push({
      area: 'Ad personalisation',
      status: 'fail',
      statusLabel: 'Still active after reject',
      explanation:
        'Ad personalisation remains active when users reject — ask your cookie banner provider to fix this.',
    });
    recommendations.push(
      'Ad personalisation is still active when users reject — ask your cookie banner provider to check this.',
    );
  }

  // Rule 9: All signals use update source (+10)
  if (hasUpdateSource(afterAccept) || hasUpdateSource(afterReject)) {
    points += 10;
    scorecard.push({
      area: 'Data validity',
      status: 'pass',
      statusLabel: 'Consent updates detected',
      explanation:
        'Consent states are being updated dynamically (not just set as defaults), indicating proper banner integration.',
    });
  } else {
    scorecard.push({
      area: 'Data validity',
      status: 'warn',
      statusLabel: 'Only default values seen',
      explanation:
        'Consent states appear to be defaults only, not actively updated. Your banner may not be communicating changes to Google tags.',
    });
    recommendations.push(
      'Ensure your consent banner calls the Google consent update command after the user makes a choice.',
    );
  }

  // Penalty: ad_storage allowed after reject (-20)
  if (adReject?.state === 'allowed') {
    points -= 20;
  }

  // Penalty: ad_personalization allowed after reject (-20)
  if (adPersoReject?.state === 'allowed') {
    points -= 20;
  }

  // E-commerce tracking scorecard row (informational, based on ad tracking)
  if (adAccept?.state === 'allowed' && adReject?.state === 'denied') {
    scorecard.push({
      area: 'E-commerce tracking',
      status: 'pass',
      statusLabel: 'Conversion tracking OK',
      explanation:
        'Ad storage allows conversion tracking after accept and correctly blocks after reject.',
    });
  } else if (adAccept?.state === 'allowed') {
    scorecard.push({
      area: 'E-commerce tracking',
      status: 'warn',
      statusLabel: 'Partial coverage',
      explanation:
        'Conversion tracking works after accept, but ad storage may not be correctly blocked after reject.',
    });
  } else {
    scorecard.push({
      area: 'E-commerce tracking',
      status: 'warn',
      statusLabel: 'Limited tracking',
      explanation:
        'Ad storage is not enabled after accept, which may limit e-commerce conversion measurement.',
    });
  }

  // Cap 0–100
  const qualityIndex = Math.max(0, Math.min(100, points));

  return { qualityIndex, scorecard, recommendations };
}

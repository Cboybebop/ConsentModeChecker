import { describe, it, expect } from 'vitest';
import { scoreAudit } from './scoring';
import { decode } from './consentDecoders';

describe('scoreAudit', () => {
  it('returns 0 with empty signals', () => {
    const empty = decode('');
    const result = scoreAudit({
      beforeBanner: false,
      afterAccept: empty,
      afterReject: empty,
    });
    expect(result.qualityIndex).toBe(0);
    expect(result.scorecard.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('produces a high score for a perfect setup', () => {
    const accept = decode('G1111');
    const reject = decode('G0000');
    const result = scoreAudit({
      beforeBanner: true,
      afterAccept: accept,
      afterReject: reject,
    });
    // Banner(10) + analytics denied default(10) + analytics allowed accept(10) +
    // analytics denied reject(15) + ad denied default(10) + ad denied reject(15) +
    // ad_user_data denied(10) + ad_personalization denied(10) = 90
    // No update source bonus (GCS source is default) → 90
    expect(result.qualityIndex).toBe(90);
    expect(result.recommendations).toHaveLength(1); // just the update source rec
  });

  it('produces a failing score for all-fail', () => {
    const accept = decode('G0000');
    const reject = decode('G1111');
    const result = scoreAudit({
      beforeBanner: false,
      afterAccept: accept,
      afterReject: reject,
    });
    // No banner(0), analytics not allowed accept(0), analytics not denied reject(0),
    // ad not denied reject(0), ad_user_data not denied(0), ad_personalization not denied(0),
    // penalties: ad_storage allowed after reject(-20), ad_personalization allowed after reject(-20)
    expect(result.qualityIndex).toBe(0); // capped at 0
    expect(result.recommendations.length).toBeGreaterThan(3);
  });

  it('handles partial scores correctly', () => {
    const accept = decode('G1111');
    const reject = decode('G0010'); // analytics denied, ad denied, ad_user_data allowed, ad_perso denied
    const result = scoreAudit({
      beforeBanner: true,
      afterAccept: accept,
      afterReject: reject,
    });
    // Some signals correct, some not
    expect(result.qualityIndex).toBeGreaterThan(0);
    expect(result.qualityIndex).toBeLessThan(100);
  });

  it('caps score at 100', () => {
    // Even with all rules passing, max should be ≤ 100
    const accept = decode('G1111');
    const reject = decode('G0000');
    const result = scoreAudit({
      beforeBanner: true,
      afterAccept: accept,
      afterReject: reject,
    });
    expect(result.qualityIndex).toBeLessThanOrEqual(100);
  });

  it('caps score at 0 (never negative)', () => {
    const accept = decode('G0000');
    const reject = decode('G1111');
    const result = scoreAudit({
      beforeBanner: false,
      afterAccept: accept,
      afterReject: reject,
    });
    expect(result.qualityIndex).toBeGreaterThanOrEqual(0);
  });

  it('scorecard has expected areas', () => {
    const accept = decode('G1111');
    const reject = decode('G0000');
    const result = scoreAudit({
      beforeBanner: true,
      afterAccept: accept,
      afterReject: reject,
    });
    const areas = result.scorecard.map((r) => r.area);
    expect(areas).toContain('Privacy & Consent compliance');
    expect(areas).toContain('Google Analytics tracking');
    expect(areas).toContain('Google Ads tracking');
    expect(areas).toContain('Ad personalisation');
  });
});

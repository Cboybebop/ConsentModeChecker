import { describe, it, expect } from 'vitest';
import { decode, detectInputType } from './consentDecoders';

describe('detectInputType', () => {
  it('detects GCS pattern', () => {
    expect(detectInputType('G100')).toBe('gcs');
    expect(detectInputType('G1111')).toBe('gcs');
    expect(detectInputType('G0000')).toBe('gcs');
  });

  it('detects GCD pattern', () => {
    expect(detectInputType('1105')).toBe('gcd');
    expect(detectInputType('15051505')).toBe('gcd');
    expect(detectInputType('1.5.0.5.1.5.0.5')).toBe('gcd');
    expect(detectInputType('15n05n15n05')).toBe('gcd');
    expect(detectInputType('13n3n3n3n5l1')).toBe('gcd');
    expect(detectInputType('13m3m3m3m5l1')).toBe('gcd');
  });

  it('returns unknown for invalid input', () => {
    expect(detectInputType('')).toBe('unknown');
    expect(detectInputType('hello')).toBe('unknown');
    expect(detectInputType('GXYZ')).toBe('unknown');
  });
});

describe('decode GCS', () => {
  it('decodes G1111 — all allowed', () => {
    const result = decode('G1111');
    expect(result.inputType).toBe('gcs');
    expect(result.overallStatus).toBe('active');
    expect(result.signals).toHaveLength(4);
    expect(result.signals[0].name).toBe('analytics_storage');
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[1].name).toBe('ad_storage');
    expect(result.signals[1].state).toBe('allowed');
    expect(result.signals[2].name).toBe('ad_user_data');
    expect(result.signals[2].state).toBe('allowed');
    expect(result.signals[3].name).toBe('ad_personalization');
    expect(result.signals[3].state).toBe('allowed');
  });

  it('decodes G0000 — all denied', () => {
    const result = decode('G0000');
    expect(result.overallStatus).toBe('active');
    expect(result.signals.every((s) => s.state === 'denied')).toBe(true);
  });

  it('decodes G100 — partial (3 chars)', () => {
    const result = decode('G100');
    expect(result.overallStatus).toBe('incomplete');
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[1].state).toBe('denied');
    expect(result.signals[2].state).toBe('denied');
    expect(result.signals[3].state).toBe('unknown');
  });

  it('handles whitespace', () => {
    const result = decode('  G1111  ');
    expect(result.inputType).toBe('gcs');
    expect(result.overallStatus).toBe('active');
  });

  it('sets source to default and mode to unknown for GCS', () => {
    const result = decode('G1111');
    for (const s of result.signals) {
      expect(s.source).toBe('default');
      expect(s.mode).toBe('unknown');
    }
  });
});

describe('decode GCD', () => {
  it('decodes basic GCD with 4 signal pairs', () => {
    // 15 05 15 05 → analytics:allowed/update/advanced, ad:denied/update/advanced, ...
    const result = decode('15051505');
    expect(result.inputType).toBe('gcd');
    expect(result.signals).toHaveLength(4);
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[0].source).toBe('update');
    expect(result.signals[0].mode).toBe('advanced');
    expect(result.signals[1].state).toBe('denied');
    expect(result.signals[1].source).toBe('update');
  });

  it('decodes GCD with default/basic encoding', () => {
    // 11 01 11 01
    const result = decode('11011101');
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[0].source).toBe('default');
    expect(result.signals[0].mode).toBe('basic');
    expect(result.signals[1].state).toBe('denied');
  });

  it('decodes GCD with unknown chars', () => {
    const result = decode('x1x1');
    expect(result.signals[0].state).toBe('unknown');
    expect(result.signals[1].state).toBe('unknown');
  });

  it('handles short GCD (2 pairs)', () => {
    const result = decode('1505');
    expect(result.signals).toHaveLength(2);
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[1].state).toBe('denied');
  });

  it('decodes dot-delimited GCD (regression)', () => {
    const result = decode('1.5.0.5.1.5.0.5');
    expect(result.inputType).toBe('gcd');
    expect(result.signals).toHaveLength(4);
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[1].state).toBe('denied');
  });

  it('decodes n-delimited GCD from network traffic', () => {
    const result = decode('15n05n15n05');
    expect(result.inputType).toBe('gcd');
    expect(result.signals).toHaveLength(4);
    expect(result.signals[0].state).toBe('allowed');
    expect(result.signals[1].state).toBe('denied');
    expect(result.signals[2].state).toBe('allowed');
    expect(result.signals[3].state).toBe('denied');
  });

  it('decodes compact network-style GCD with n separators', () => {
    const result = decode('13n3n3n3n5l1');
    expect(result.inputType).toBe('gcd');
    expect(result.signals).toHaveLength(4);
    expect(result.signals.every((s) => s.state === 'denied')).toBe(true);
  });

  it('decodes compact network-style GCD with m separators', () => {
    const result = decode('13m3m3m3m5l1');
    expect(result.inputType).toBe('gcd');
    expect(result.signals).toHaveLength(4);
    expect(result.signals.every((s) => s.state === 'denied')).toBe(true);
  });
});

describe('decode GCD metadata', () => {
  it('parses metadata from network-style GCD with trailing characters', () => {
    // 13n3n3n3n5l1p0p1p1p1p1p0 — after the '5' marker:
    // codes after 5: ['1', '0', '1', '1', '1', '1', '0']
    // pos0=1 (US privacy: yes), pos1=0 (container defaults: no), pos2=1 (ad personalization: yes)
    // pos3=1 (ad_storage: true), pos4=1 (analytics_storage: true),
    // pos5=1 (ad_user_data: true), pos6=0 (ad_personalization: false)
    const result = decode('13n3n3n3n5l1p0p1p1p1p1p0');
    expect(result.inputType).toBe('gcd');
    expect(result.globalPrivacyControls).toBeDefined();
    expect(result.globalPrivacyControls!.usPrivacyLawsOptedIn).toBe('yes');
    expect(result.globalPrivacyControls!.usedContainerDefaults).toBe('no');
    expect(result.globalPrivacyControls!.adPersonalizationSignals).toBe('yes');
    expect(result.containerScopedDefaults).toBeDefined();
    expect(result.containerScopedDefaults!.adStorage).toBe(true);
    expect(result.containerScopedDefaults!.analyticsStorage).toBe(true);
    expect(result.containerScopedDefaults!.adUserData).toBe(true);
    expect(result.containerScopedDefaults!.adPersonalization).toBe(false);
  });

  it('parses partial metadata from network-style GCD', () => {
    // 13n3n3n3n5l1 — only one code after '5': ['1']
    const result = decode('13n3n3n3n5l1');
    expect(result.inputType).toBe('gcd');
    expect(result.globalPrivacyControls).toBeDefined();
    expect(result.globalPrivacyControls!.usPrivacyLawsOptedIn).toBe('yes');
    expect(result.globalPrivacyControls!.usedContainerDefaults).toBe('na');
    expect(result.globalPrivacyControls!.adPersonalizationSignals).toBe('na');
    expect(result.containerScopedDefaults!.adStorage).toBeNull();
  });

  it('returns no metadata for GCD without trailing characters', () => {
    const result = decode('15051505');
    expect(result.inputType).toBe('gcd');
    expect(result.globalPrivacyControls).toBeUndefined();
    expect(result.containerScopedDefaults).toBeUndefined();
  });

  it('returns no metadata for GCS input', () => {
    const result = decode('G1111');
    expect(result.inputType).toBe('gcs');
    expect(result.globalPrivacyControls).toBeUndefined();
    expect(result.containerScopedDefaults).toBeUndefined();
  });

  it('parses metadata from standard GCD with trailing chars', () => {
    // 15051505x1x1x1 (7 signal pairs = 14 chars) + 01011110 (8 metadata chars)
    const result = decode('15051505x1x1x101011110');
    expect(result.inputType).toBe('gcd');
    expect(result.globalPrivacyControls).toBeDefined();
    expect(result.globalPrivacyControls!.usPrivacyLawsOptedIn).toBe('no');
    expect(result.globalPrivacyControls!.usedContainerDefaults).toBe('yes');
    expect(result.globalPrivacyControls!.adPersonalizationSignals).toBe('no');
    expect(result.containerScopedDefaults!.adStorage).toBe(true);
    expect(result.containerScopedDefaults!.analyticsStorage).toBe(true);
    expect(result.containerScopedDefaults!.adPersonalization).toBe(true);
    expect(result.containerScopedDefaults!.usedContainerScopedDefaults).toBe(false);
  });

  it('parses usedContainerScopedDefaults flag', () => {
    const result = decode('13n3n3n3n5l0p1p0p1p1p1p1p1');
    expect(result.containerScopedDefaults).toBeDefined();
    expect(result.containerScopedDefaults!.usedContainerScopedDefaults).toBe(true);
  });
});

describe('decode — invalid input', () => {
  it('returns unknown for empty string', () => {
    const result = decode('');
    expect(result.inputType).toBe('unknown');
    expect(result.overallStatus).toBe('missing');
    expect(result.signals).toHaveLength(0);
  });

  it('returns unknown for garbage', () => {
    const result = decode('not-a-code');
    expect(result.inputType).toBe('unknown');
    expect(result.overallStatus).toBe('missing');
  });

  it('has a user-friendly summary for unknown input', () => {
    const result = decode('xyz');
    expect(result.overallSummary).toContain("doesn't look like a valid");
  });

  it('rejects malformed n-delimited GCD variants', () => {
    expect(detectInputType('13n3n3n3n51')).toBe('unknown');
    expect(decode('13n3n3n3n51').inputType).toBe('unknown');
    expect(detectInputType('15nn05')).toBe('unknown');
    expect(detectInputType('15n0z')).toBe('unknown');
  });
});

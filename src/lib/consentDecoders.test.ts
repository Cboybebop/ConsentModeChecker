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
});

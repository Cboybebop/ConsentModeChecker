import { decode } from '../../lib/consentDecoders';
import { scoreAudit } from '../../lib/scoring';
import type { DecodeResult } from '../../lib/consentDecoders';
import type { ScoreResult } from '../../lib/scoring';

// Good result: all signals correct after accept, all denied after reject
export const goodAccept: DecodeResult = decode('G1111');
export const goodReject: DecodeResult = decode('G0000');
export const goodScore: ScoreResult = scoreAudit({
  beforeBanner: true,
  afterAccept: goodAccept,
  afterReject: goodReject,
});

// Mixed result: some signals wrong after reject
export const mixedAccept: DecodeResult = decode('G1111');
export const mixedReject: DecodeResult = decode('G0010');
export const mixedScore: ScoreResult = scoreAudit({
  beforeBanner: true,
  afterAccept: mixedAccept,
  afterReject: mixedReject,
});

// Bad result: consent mode not detected / all denied by default
export const badAccept: DecodeResult = decode('G0000');
export const badReject: DecodeResult = decode('G0000');
export const badScore: ScoreResult = scoreAudit({
  beforeBanner: false,
  afterAccept: badAccept,
  afterReject: badReject,
});

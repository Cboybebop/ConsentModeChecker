// Pure TypeScript consent decoding module — no DOM, no network, no side effects.

export type ConsentState = 'allowed' | 'denied' | 'unknown';
export type ConsentSource = 'default' | 'update';
export type ConsentMode = 'basic' | 'advanced' | 'unknown';
export type OverallStatus = 'active' | 'incomplete' | 'missing';
export type TriState = 'yes' | 'no' | 'na';

export interface SignalResult {
  name: string;
  displayName: string;
  state: ConsentState;
  source: ConsentSource;
  mode: ConsentMode;
  statusLabel: string;
  implication: string;
}

export interface GlobalPrivacyControls {
  usPrivacyLawsOptedIn: TriState;
  usedContainerDefaults: TriState;
  adPersonalizationSignals: TriState;
}

export interface ContainerScopedDefaults {
  adStorage: boolean | null;
  analyticsStorage: boolean | null;
  adUserData: boolean | null;
  adPersonalization: boolean | null;
  usedContainerScopedDefaults: boolean | null;
}

export interface DecodeResult {
  inputType: 'gcs' | 'gcd' | 'unknown';
  overallStatus: OverallStatus;
  overallSummary: string;
  signals: SignalResult[];
  rawInput: string;
  globalPrivacyControls?: GlobalPrivacyControls;
  containerScopedDefaults?: ContainerScopedDefaults;
}

// ---------------------------------------------------------------------------
// Signal definitions
// ---------------------------------------------------------------------------

interface SignalDef {
  name: string;
  displayName: string;
}

const SIGNAL_DEFS: SignalDef[] = [
  { name: 'analytics_storage', displayName: 'Analytics Storage' },
  { name: 'ad_storage', displayName: 'Ad Storage' },
  { name: 'ad_user_data', displayName: 'Ad User Data' },
  { name: 'ad_personalization', displayName: 'Ad Personalisation' },
];

// Extended signals that only appear in GCD (positions 5–7)
const EXTENDED_SIGNAL_DEFS: SignalDef[] = [
  { name: 'personalization_storage', displayName: 'Personalisation Storage' },
  { name: 'functionality_storage', displayName: 'Functionality Storage' },
  { name: 'security_storage', displayName: 'Security Storage' },
];

// ---------------------------------------------------------------------------
// Implication text helpers
// ---------------------------------------------------------------------------

function implicationText(signalName: string, state: ConsentState): string {
  const implications: Record<string, Record<ConsentState, string>> = {
    analytics_storage: {
      allowed:
        'Google Analytics cookies are active and collecting data. User browsing behaviour is being tracked for analytics purposes.',
      denied:
        'Google Analytics cookies are blocked. Aggregated, cookieless measurement may still occur via Consent Mode modelling.',
      unknown:
        'The analytics storage state could not be determined. This may mean Consent Mode is not fully configured for analytics.',
    },
    ad_storage: {
      allowed:
        'Advertising cookies are active and can store information on the user\'s device. Ad conversion tracking is fully operational.',
      denied:
        'Advertising cookies are blocked. Google Ads will use modelled conversions instead of direct measurement.',
      unknown:
        'The ad storage state could not be determined. Advertising measurement may not be working as expected.',
    },
    ad_user_data: {
      allowed:
        'User data can be sent to Google for advertising purposes. This includes data used for remarketing and audience building.',
      denied:
        'User data is not being sent to Google for advertising. Remarketing audiences will not include this user.',
      unknown:
        'It is unclear whether user data is being sent to Google for ads. Check your Consent Mode configuration.',
    },
    ad_personalization: {
      allowed:
        'Ad personalisation is enabled — Google can use this visitor\'s data to show them targeted ads. Remarketing lists are being populated.',
      denied:
        'Ad personalisation is off — Google will not use this visitor\'s data for ad targeting. Only contextual ads will be shown.',
      unknown:
        'Ad personalisation status is unclear. Targeted advertising behaviour is unpredictable for this visitor.',
    },
    personalization_storage: {
      allowed:
        'Storage related to personalisation (e.g. video recommendations) is enabled. The site can remember user preferences.',
      denied:
        'Personalisation storage is blocked. Features that rely on remembering preferences may not work correctly.',
      unknown:
        'Personalisation storage status is unknown. Preference-related features may behave unpredictably.',
    },
    functionality_storage: {
      allowed:
        'Functionality storage is enabled, supporting features like language preferences and UI customisation.',
      denied:
        'Functionality storage is blocked. Some site features that depend on saved settings may not work properly.',
      unknown:
        'Functionality storage status is unknown. Some site features may not work as expected.',
    },
    security_storage: {
      allowed:
        'Security-related storage is enabled. This supports features like fraud prevention and secure authentication.',
      denied:
        'Security storage is blocked. This is unusual and may affect login security and fraud prevention.',
      unknown:
        'Security storage status is unknown. Security features should generally remain enabled.',
    },
  };

  return implications[signalName]?.[state] ?? 'No additional information available for this signal.';
}

function statusLabel(state: ConsentState, source: ConsentSource): string {
  if (state === 'allowed' && source === 'update') return 'On after consent';
  if (state === 'allowed' && source === 'default') return 'On by default';
  if (state === 'denied' && source === 'update') return 'Off after user choice';
  if (state === 'denied' && source === 'default') return 'Off by default';
  return 'Status unknown';
}

// ---------------------------------------------------------------------------
// GCS decoding
// ---------------------------------------------------------------------------
// GCS format: "G" followed by a 3-digit code (e.g. "G100", "G111", "G110")
// Position mapping:
//   Position 1 (index 1): analytics_storage — 1=allowed, 0=denied
//   Position 2 (index 2): ad_storage        — 1=allowed, 0=denied
//   Position 3 (index 3): ad_user_data      — 1=allowed, 0=denied
// GCS doesn't encode ad_personalization separately; we infer it from ad_storage.
// Values: '1' = allowed, '0' = denied, anything else = unknown

const GCS_PATTERN = /^G[0-9x]{1,4}$/i;

function decodeGcsChar(ch: string | undefined): ConsentState {
  if (ch === '1') return 'allowed';
  if (ch === '0') return 'denied';
  return 'unknown';
}

function decodeGcs(input: string): DecodeResult {
  const trimmed = input.trim();
  const chars = trimmed.slice(1); // remove leading 'G'

  const signals: SignalResult[] = SIGNAL_DEFS.map((def, i) => {
    const state = decodeGcsChar(chars[i]);
    return {
      name: def.name,
      displayName: def.displayName,
      state,
      source: 'default' as ConsentSource,
      mode: 'unknown' as ConsentMode,
      statusLabel: statusLabel(state, 'default'),
      implication: implicationText(def.name, state),
    };
  });

  const knownCount = signals.filter((s) => s.state !== 'unknown').length;
  const overallStatus: OverallStatus =
    knownCount === 0 ? 'missing' : knownCount === signals.length ? 'active' : 'incomplete';

  const overallSummary =
    overallStatus === 'active'
      ? 'Consent Mode is active — all core signals are detected in this GCS value.'
      : overallStatus === 'incomplete'
        ? 'Consent Mode is partially configured — some signals are present but others could not be determined.'
        : 'Consent Mode does not appear to be active based on this GCS value.';

  return { inputType: 'gcs', overallStatus, overallSummary, signals, rawInput: trimmed };
}

// ---------------------------------------------------------------------------
// GCD decoding
// ---------------------------------------------------------------------------
// GCD format: positional characters separated by dots or as a continuous string.
// Common pattern: "11x1x1x1x5" (no dots) or "1.1.x.1.x.1.x.1.x.5"
// Each pair of characters encodes one consent signal.
//
// Encoding per character pair (e.g. "11"):
//   Character 1 — consent state:
//     '1' = allowed (granted)
//     '0' = denied
//     'x' or '-' = unknown / not set
//   Character 2 — source + mode flag:
//     '1' = default + basic
//     '5' = update + advanced
//     '3' = default + advanced
//     '7' = update + basic
//     'x' or '-' = unknown
//
// Positional mapping (character pairs):
//   Pair 0 (chars 0-1): analytics_storage
//   Pair 1 (chars 2-3): ad_storage
//   Pair 2 (chars 4-5): ad_user_data
//   Pair 3 (chars 6-7): ad_personalization
//   Pair 4 (chars 8-9): personalization_storage (if present)
//   Pair 5 (chars 10-11): functionality_storage (if present)
//   Pair 6 (chars 12-13): security_storage (if present)

const GCD_STATE_CHAR = '[01x\\-]';
const GCD_META_CHAR = '[1357x\\-]';
const GCD_PAIR_PATTERN = `${GCD_STATE_CHAR}${GCD_META_CHAR}`;
const GCD_DELIMITER_PATTERN = '[.n]';
// Optional trailing metadata: up to 8 digits [01] after signal pairs
const GCD_TRAILING_META = '[01]{0,8}';
const GCD_PATTERN = new RegExp(`^${GCD_PAIR_PATTERN}(${GCD_PAIR_PATTERN}){1,6}${GCD_TRAILING_META}$`, 'i');
const GCD_DELIMITED_PATTERN = new RegExp(
  `^${GCD_PAIR_PATTERN}(${GCD_DELIMITER_PATTERN}${GCD_PAIR_PATTERN}){1,6}(${GCD_DELIMITER_PATTERN}${GCD_TRAILING_META})?$`,
  'i',
);
const GCD_CHAR_DELIMITED_PATTERN = new RegExp(
  `^${GCD_STATE_CHAR}${GCD_DELIMITER_PATTERN}${GCD_META_CHAR}(${GCD_DELIMITER_PATTERN}${GCD_STATE_CHAR}${GCD_DELIMITER_PATTERN}${GCD_META_CHAR}){1,6}$`,
  'i',
);

function parseGcdState(ch: string | undefined): ConsentState {
  if (ch === '1') return 'allowed';
  if (ch === '0') return 'denied';
  return 'unknown';
}

function parseGcdSourceMode(ch: string | undefined): { source: ConsentSource; mode: ConsentMode } {
  switch (ch) {
    case '1':
      return { source: 'default', mode: 'basic' };
    case '3':
      return { source: 'default', mode: 'advanced' };
    case '5':
      return { source: 'update', mode: 'advanced' };
    case '7':
      return { source: 'update', mode: 'basic' };
    default:
      return { source: 'default', mode: 'unknown' };
  }
}

function parseCompactGcdCode(ch: string | undefined): {
  state: ConsentState;
  source: ConsentSource;
  mode: ConsentMode;
} {
  if (!ch) return { state: 'unknown', source: 'default', mode: 'unknown' };

  // Letter-based compact codes seen in network traffic.
  if (/[trnuv]/i.test(ch)) return { state: 'allowed', source: 'default', mode: 'unknown' };
  if (/[pqm]/i.test(ch)) return { state: 'denied', source: 'default', mode: 'unknown' };
  if (/[lx\-]/i.test(ch)) return { state: 'unknown', source: 'default', mode: 'unknown' };

  // Numeric compact codes: preserve source/mode when possible.
  if (/[1357]/.test(ch)) {
    const { source, mode } = parseGcdSourceMode(ch);
    return { state: 'denied', source, mode };
  }
  if (ch === '0') return { state: 'denied', source: 'default', mode: 'unknown' };
  if (ch === '1') return { state: 'allowed', source: 'default', mode: 'basic' };

  return { state: 'unknown', source: 'default', mode: 'unknown' };
}

// ---------------------------------------------------------------------------
// GCD metadata parsing (trailing characters after consent signal pairs)
// ---------------------------------------------------------------------------
// After the consent signal pairs, the GCD parameter may encode additional
// metadata about privacy controls and container-scoped defaults.
//
// Positional mapping for trailing metadata characters:
//   Position 0: US Privacy Laws opted in (1=yes, 0=no, else N/A)
//   Position 1: Used Container Defaults (1=yes, 0=no, else N/A)
//   Position 2: Ad Personalization Signals (1=yes, 0=no, else N/A)
//   Position 3: Container-scoped default for ad_storage (1=true, 0=false)
//   Position 4: Container-scoped default for analytics_storage (1=true, 0=false)
//   Position 5: Container-scoped default for ad_user_data (1=true, 0=false)
//   Position 6: Container-scoped default for ad_personalization (1=true, 0=false)
//   Position 7: UsedContainerScopedDefaults flag (1=true, 0=false)

interface GcdMetadata {
  globalPrivacyControls: GlobalPrivacyControls;
  containerScopedDefaults: ContainerScopedDefaults;
}

function parseTriState(ch: string | undefined): TriState {
  if (ch === '1') return 'yes';
  if (ch === '0') return 'no';
  return 'na';
}

function parseBoolFlag(ch: string | undefined): boolean | null {
  if (ch === '1') return true;
  if (ch === '0') return false;
  return null;
}

function parseGcdMetadata(metaChars: string[]): GcdMetadata | null {
  if (metaChars.length === 0) return null;

  return {
    globalPrivacyControls: {
      usPrivacyLawsOptedIn: parseTriState(metaChars[0]),
      usedContainerDefaults: parseTriState(metaChars[1]),
      adPersonalizationSignals: parseTriState(metaChars[2]),
    },
    containerScopedDefaults: {
      adStorage: parseBoolFlag(metaChars[3]),
      analyticsStorage: parseBoolFlag(metaChars[4]),
      adUserData: parseBoolFlag(metaChars[5]),
      adPersonalization: parseBoolFlag(metaChars[6]),
      usedContainerScopedDefaults: parseBoolFlag(metaChars[7]),
    },
  };
}

function decodeNetworkStyleGcd(input: string): DecodeResult | null {
  const trimmed = input.trim();
  if (!trimmed.toLowerCase().startsWith('1')) return null;

  // Parse shape: 1<code><sep><code><sep>... where sep is often a letter (e.g. n/m/l).
  const codes: string[] = [];
  let i = 1;
  while (i < trimmed.length) {
    const code = trimmed[i];
    codes.push(code);
    i += 1;
    if (i >= trimmed.length) break;
    const sep = trimmed[i];
    if (!/[a-z]/i.test(sep)) return null;
    i += 1;
  }

  const endIdx = codes.findIndex((c) => c === '5');
  if (endIdx < 4) return null;

  const signalCodes = codes.slice(0, endIdx).slice(0, SIGNAL_DEFS.length + EXTENDED_SIGNAL_DEFS.length);
  const metaCodes = codes.slice(endIdx + 1);
  const allDefs = [...SIGNAL_DEFS, ...EXTENDED_SIGNAL_DEFS];

  const signals: SignalResult[] = signalCodes.map((code, idx) => {
    const { state, source, mode } = parseCompactGcdCode(code);
    const def = allDefs[idx];
    return {
      name: def.name,
      displayName: def.displayName,
      state,
      source,
      mode,
      statusLabel: statusLabel(state, source),
      implication: implicationText(def.name, state),
    };
  });

  const knownCount = signals.filter((s) => s.state !== 'unknown').length;
  const overallStatus: OverallStatus =
    knownCount === 0 ? 'missing' : knownCount === signals.length ? 'active' : 'incomplete';
  const overallSummary =
    overallStatus === 'active'
      ? 'Consent Mode is active — all signals are detected in this GCD parameter.'
      : overallStatus === 'incomplete'
        ? 'Consent Mode is partially configured — some signals could not be determined from this GCD value.'
        : 'Consent Mode does not appear to be active based on this GCD value.';

  const metadata = parseGcdMetadata(metaCodes);
  return {
    inputType: 'gcd',
    overallStatus,
    overallSummary,
    signals,
    rawInput: trimmed,
    ...(metadata && {
      globalPrivacyControls: metadata.globalPrivacyControls,
      containerScopedDefaults: metadata.containerScopedDefaults,
    }),
  };
}

function decodeGcd(input: string): DecodeResult {
  const trimmed = input.trim();

  // Normalise: remove accepted delimiters before parsing positional pairs
  const normalised = trimmed.replace(/[.n]/gi, '');

  // Defensive validation after normalisation — only strict state/meta pairs are allowed.
  if (!GCD_PATTERN.test(normalised)) {
    return {
      inputType: 'unknown',
      overallStatus: 'missing',
      overallSummary:
        "That doesn't look like a valid GCS or GCD code. Check the 'How to find this' tab for guidance on locating your code.",
      signals: [],
      rawInput: trimmed,
    };
  }

  const allDefs = [...SIGNAL_DEFS, ...EXTENDED_SIGNAL_DEFS];

  const signals: SignalResult[] = [];
  for (let i = 0; i < allDefs.length; i++) {
    const charIdx = i * 2;
    if (charIdx >= normalised.length) break;
    const stateChar = normalised[charIdx];
    const metaChar = normalised[charIdx + 1];
    const state = parseGcdState(stateChar);
    const { source, mode } = parseGcdSourceMode(metaChar);
    const def = allDefs[i];
    signals.push({
      name: def.name,
      displayName: def.displayName,
      state,
      source,
      mode,
      statusLabel: statusLabel(state, source),
      implication: implicationText(def.name, state),
    });
  }

  // Extract trailing metadata characters beyond signal pairs
  const signalCharsUsed = signals.length * 2;
  const trailingChars = normalised.slice(signalCharsUsed).split('');
  const metadata = parseGcdMetadata(trailingChars);

  const knownCount = signals.filter((s) => s.state !== 'unknown').length;
  const overallStatus: OverallStatus =
    knownCount === 0 ? 'missing' : knownCount === signals.length ? 'active' : 'incomplete';

  const overallSummary =
    overallStatus === 'active'
      ? 'Consent Mode is active — all signals are detected in this GCD parameter.'
      : overallStatus === 'incomplete'
        ? 'Consent Mode is partially configured — some signals could not be determined from this GCD value.'
        : 'Consent Mode does not appear to be active based on this GCD value.';

  return {
    inputType: 'gcd',
    overallStatus,
    overallSummary,
    signals,
    rawInput: trimmed,
    ...(metadata && {
      globalPrivacyControls: metadata.globalPrivacyControls,
      containerScopedDefaults: metadata.containerScopedDefaults,
    }),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Detect input type by pattern matching and decode accordingly. */
export function decode(input: string): DecodeResult {
  const trimmed = input.trim();

  if (GCS_PATTERN.test(trimmed)) {
    return decodeGcs(trimmed);
  }

  if (
    GCD_PATTERN.test(trimmed) ||
    GCD_DELIMITED_PATTERN.test(trimmed) ||
    GCD_CHAR_DELIMITED_PATTERN.test(trimmed)
  ) {
    return decodeGcd(trimmed);
  }

  const networkStyleGcd = decodeNetworkStyleGcd(trimmed);
  if (networkStyleGcd) return networkStyleGcd;

  // Unrecognised input
  return {
    inputType: 'unknown',
    overallStatus: 'missing',
    overallSummary:
      "That doesn't look like a valid GCS or GCD code. Check the 'How to find this' tab for guidance on locating your code.",
    signals: [],
    rawInput: trimmed,
  };
}

/** Convenience: detect whether input looks like GCS, GCD, or unknown. */
export function detectInputType(input: string): 'gcs' | 'gcd' | 'unknown' {
  const trimmed = input.trim();
  if (GCS_PATTERN.test(trimmed)) return 'gcs';
  if (
    GCD_PATTERN.test(trimmed) ||
    GCD_DELIMITED_PATTERN.test(trimmed) ||
    GCD_CHAR_DELIMITED_PATTERN.test(trimmed)
  ) {
    return 'gcd';
  }
  if (decodeNetworkStyleGcd(trimmed)) return 'gcd';
  return 'unknown';
}

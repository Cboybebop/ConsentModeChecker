interface DiffItem {
  signal: string;
  previousState: string;
  currentState: string;
}

interface AuditDiffViewProps {
  currentDecoded: Record<string, unknown>;
  previousDecoded: Record<string, unknown>;
}

function extractSignals(decoded: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  // Try to extract from nested acceptResult/rejectResult structures
  const sources = ['acceptResult', 'rejectResult'] as const;
  for (const key of sources) {
    const inner = decoded[key] as Record<string, unknown> | undefined;
    if (inner?.signals && Array.isArray(inner.signals)) {
      for (const s of inner.signals as Array<{ name: string; state: string }>) {
        result[`${key}.${s.name}`] = s.state;
      }
    }
  }
  // Fallback: direct signals array
  if (Object.keys(result).length === 0 && decoded.signals && Array.isArray(decoded.signals)) {
    for (const s of decoded.signals as Array<{ name: string; state: string }>) {
      result[s.name] = s.state;
    }
  }
  return result;
}

export function AuditDiffView({ currentDecoded, previousDecoded }: AuditDiffViewProps) {
  const current = extractSignals(currentDecoded);
  const previous = extractSignals(previousDecoded);

  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(previous)]));
  const diffs: DiffItem[] = [];

  for (const key of allKeys) {
    const prev = previous[key] ?? 'N/A';
    const curr = current[key] ?? 'N/A';
    if (prev !== curr) {
      diffs.push({ signal: key.replace(/^(acceptResult|rejectResult)\./, '($1) '), previousState: prev, currentState: curr });
    }
  }

  if (diffs.length === 0) {
    return (
      <p className="text-sm text-gray-500">No changes compared to the previous audit.</p>
    );
  }

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">Changes from previous audit</h4>
      <ul className="space-y-1">
        {diffs.map((d) => (
          <li key={d.signal} className="text-sm text-gray-700">
            <span className="font-medium">{d.signal}</span> changed from{' '}
            <span className="text-red-600">{d.previousState}</span> →{' '}
            <span className="text-green-600">{d.currentState}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

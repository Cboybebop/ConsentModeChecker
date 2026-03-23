import { Tooltip } from '../../components/ui/Tooltip';
import { TOOLTIPS } from '../../constants/text';

interface QualityGaugeProps {
  value: number;
}

function gaugeColor(v: number): string {
  if (v >= 80) return 'text-green-600';
  if (v >= 50) return 'text-amber-500';
  return 'text-red-600';
}

function gaugeBg(v: number): string {
  if (v >= 80) return 'bg-green-500';
  if (v >= 50) return 'bg-amber-400';
  return 'bg-red-500';
}

function gaugeLabel(v: number): string {
  if (v >= 80) return 'Good';
  if (v >= 50) return 'Needs improvement';
  return 'Poor';
}

export function QualityGauge({ value }: QualityGaugeProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6">
      <Tooltip content={TOOLTIPS.quality_index}>
        <span className="mb-1 text-sm font-medium text-gray-500">Quality Index</span>
      </Tooltip>
      <span className={`text-5xl font-bold ${gaugeColor(value)}`}>{value}</span>
      <span className="mt-1 text-sm text-gray-500">{gaugeLabel(value)}</span>
      <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${gaugeBg(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

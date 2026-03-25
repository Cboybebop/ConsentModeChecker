import { HELP } from '../../constants/text';

export function HowToFindCode() {
  const { steps } = HELP.howToFind;

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Follow these steps to find your GCS or GCD code in Chrome:
      </p>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-md bg-blue-50 p-3 dark:bg-blue-500/10">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Look for requests to{' '}
          <code className="rounded bg-blue-100 px-1 dark:bg-blue-500/20">
            google-analytics.com/collect
          </code>{' '}
          or{' '}
          <code className="rounded bg-blue-100 px-1 dark:bg-blue-500/20">
            googleads.g.doubleclick.net
          </code>
          . The GCS/GCD value will be in the URL query parameters.
        </p>
      </div>
    </div>
  );
}

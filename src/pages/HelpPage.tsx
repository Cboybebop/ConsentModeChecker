import { Card } from '../components/ui/Card';
import { HELP } from '../constants/text';

export function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Help & FAQ</h1>

      <div className="space-y-8">
        {/* What is Consent Mode */}
        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{HELP.whatIsConsentMode.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{HELP.whatIsConsentMode.body}</p>
        </Card>

        {/* What are GCS/GCD */}
        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">{HELP.whatAreGcsGcd.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{HELP.whatAreGcsGcd.body}</p>
        </Card>

        {/* How to find codes */}
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{HELP.howToFind.title}</h2>
          <ol className="space-y-2">
            {HELP.howToFind.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* FAQ */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {HELP.faq.map((item, i) => (
              <Card key={i}>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{item.q}</h3>
                <p className="text-sm text-gray-600">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

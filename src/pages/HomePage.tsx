import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HERO, STEPS } from '../constants/text';

export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {HERO.headline}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">{HERO.subCopy}</p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/quick-check">
            <Button size="lg">{HERO.ctaQuickCheck}</Button>
          </Link>
          <Link to="/audit">
            <Button size="lg" variant="secondary">
              {HERO.ctaAudit}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.number} className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
              {step.number}
            </div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

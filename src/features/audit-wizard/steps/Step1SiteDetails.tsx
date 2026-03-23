import { WIZARD } from '../../../constants/text';

interface Step1Props {
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  siteName: string;
  setSiteName: (v: string) => void;
  bannerChoice: 'yes' | 'no' | 'unsure' | null;
  setBannerChoice: (v: 'yes' | 'no' | 'unsure') => void;
}

export function Step1SiteDetails({
  siteUrl, setSiteUrl, siteName, setSiteName, bannerChoice, setBannerChoice,
}: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{WIZARD.step1Title}</h2>
        <p className="text-sm text-gray-600">{WIZARD.step1Description}</p>
      </div>

      <div>
        <label htmlFor="site-url" className="block text-sm font-medium text-gray-700">
          Site URL <span className="text-red-500">*</span>
        </label>
        <input
          id="site-url"
          type="url"
          required
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
          Site name (optional)
        </label>
        <input
          id="site-name"
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="My Website"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">{WIZARD.bannerQuestion}</p>
        <div className="space-y-2">
          {([
            { value: 'yes' as const, label: WIZARD.bannerYes },
            { value: 'no' as const, label: WIZARD.bannerNo },
            { value: 'unsure' as const, label: WIZARD.bannerNotSure },
          ]).map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 rounded-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="banner-choice"
                value={opt.value}
                checked={bannerChoice === opt.value}
                onChange={() => setBannerChoice(opt.value)}
                className="mt-0.5"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

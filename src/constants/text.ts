// All user-visible copy lives here for easy editing and future i18n.

export const APP_NAME = 'Consent Mode Checker';

export const HERO = {
  headline: 'See if your Google Consent Mode is working — no code required.',
  subCopy:
    'Paste a GCS or GCD code from your browser\'s Network tab and get a plain-language report showing exactly what data Google is collecting and whether your consent settings are correct.',
  ctaQuickCheck: 'Start Quick Check',
  ctaAudit: 'Run Guided Audit',
};

export const STEPS = [
  {
    number: 1,
    title: 'Open your site in Chrome and copy the code from the Network tab',
    description:
      'Visit your website, open Chrome DevTools (F12), go to the Network tab, and look for requests containing "gcs" or "gcd" parameters.',
  },
  {
    number: 2,
    title: 'Paste it here',
    description:
      'Copy the value of the gcs or gcd parameter and paste it into our checker. We\'ll decode it instantly.',
  },
  {
    number: 3,
    title: 'Read your plain-language report and know what to fix',
    description:
      'Get a clear, jargon-free explanation of what each consent signal means and what you need to change.',
  },
];

export const LOCAL_MODE_BANNER =
  'Local demo — audits are saved in this browser only.';

export const QUICK_CHECK = {
  tabGcs: 'GCS code',
  tabGcd: 'GCD parameter',
  tabHelp: 'How to find this',
  placeholderGcs: 'G100',
  placeholderGcd: '15n05n15n05',
  analyseButton: 'Analyse',
  errorUnrecognised:
    "That doesn't look like a valid code — see the 'How to find this' tab for guidance.",
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Consent Mode: Active',
  incomplete: 'Consent Mode: Incomplete',
  missing: 'Consent Mode: Not detected',
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  active:
    'All core consent signals were detected. Your Consent Mode implementation appears to be working.',
  incomplete:
    'Some consent signals are present but others could not be determined. Your implementation may need attention.',
  missing:
    'No consent signals were detected. Consent Mode may not be set up on this site.',
};

export const BADGE_LABELS: Record<string, string> = {
  allowed: 'Allowed',
  denied: 'Denied',
  mixed: 'Mixed',
  unknown: 'Unknown',
};

export const WIZARD = {
  step1Title: 'Site Details',
  step1Description: 'Tell us about the site you want to audit.',
  step2Title: 'After Accept',
  step2Description: "Paste the code you saw after clicking 'Accept all cookies'.",
  step3Title: 'After Reject',
  step3Description: "Paste the code you saw after clicking 'Reject' or 'Only necessary cookies'.",
  step4Title: 'Summary & Scorecard',
  step4Description: 'Your audit results and recommendations.',
  bannerQuestion: 'Does your site show a consent banner before Google tags load?',
  bannerYes: 'Yes — the banner appears before any tracking starts.',
  bannerNo: 'No — tracking may start before the banner is shown.',
  bannerNotSure: 'Not sure — I don\'t know when tracking starts relative to the banner.',
};

export const HELP = {
  whatIsConsentMode: {
    title: 'What is Google Consent Mode?',
    body: 'Google Consent Mode is a feature that lets your website adjust how Google tags behave based on the consent choices your visitors make. When someone visits your site and interacts with your cookie banner, Consent Mode tells Google services like Analytics and Ads whether they have permission to use cookies and collect data. This helps you stay compliant with privacy regulations like GDPR while still getting useful (modelled) data from Google.',
  },
  whatAreGcsGcd: {
    title: 'What are GCS and GCD codes?',
    body: 'GCS and GCD are short codes that Google adds to network requests made by its tags. They encode the current state of each consent signal — like whether analytics cookies are allowed or denied. By reading these codes, you can verify exactly what Google "sees" in terms of consent, without needing to read any code.',
  },
  howToFind: {
    title: 'How do I find my codes in Chrome?',
    steps: [
      'Open your website in Google Chrome.',
      'Press F12 (or right-click → Inspect) to open DevTools.',
      'Click the "Network" tab at the top of DevTools.',
      'Reload your page and interact with your consent banner.',
      'In the Network tab filter box, type "collect" or "google".',
      'Click on any request to Google (e.g. google-analytics.com).',
      'Look in the URL or Payload tab for a parameter called "gcs" or "gcd".',
      'Copy the value (e.g. "G100", "11x1x1x1x5", "15n05n15n05", or "13n3n3n3n5l1") and paste it into the checker.',
    ],
  },
  faq: [
    {
      q: 'Do I need to be a developer to use this tool?',
      a: 'No. This tool is designed for marketers and site owners. You just need to copy a short code from Chrome and paste it here.',
    },
    {
      q: 'Is my data sent anywhere?',
      a: 'The decoding happens entirely in your browser. If you are logged in and save an audit, the results are stored securely in your account. In local mode, everything stays in your browser.',
    },
    {
      q: 'What should I do if my results show red items?',
      a: 'Red items mean a consent signal may not be configured correctly. Share the report with your developer or cookie banner provider and ask them to review the specific signals that are flagged.',
    },
    {
      q: 'How often should I run an audit?',
      a: 'We recommend running an audit after any changes to your cookie banner, consent management platform, or Google tag setup. A monthly check is a good habit.',
    },
    {
      q: 'Does this tool work with Consent Mode v1?',
      a: 'This tool is designed for Consent Mode v2, which includes additional signals like ad_user_data and ad_personalization. V1 codes will partially decode but may show some signals as "unknown".',
    },
    {
      q: 'Can I export my audit results?',
      a: 'Yes. On the audit summary page you can download a PDF summary using the "Download PDF summary" button.',
    },
    {
      q: 'What is the Quality Index?',
      a: 'The Quality Index is a score from 0 to 100 that rates how well your Consent Mode implementation follows best practices. Higher is better. A score above 80 generally indicates a solid setup.',
    },
  ],
};

export const TOOLTIPS: Record<string, string> = {
  gcs: 'GCS (Google Consent State) is a short code in Google network requests that shows the current consent settings for each storage type.',
  gcd: 'GCD (Google Consent Default) encodes the default and updated consent states, including whether the site uses basic or advanced Consent Mode.',
  analytics_storage:
    'Controls whether Google Analytics can use cookies to collect browsing data. When denied, Google uses privacy-safe modelled data instead.',
  ad_storage:
    'Controls whether Google Ads can store cookies on the visitor\'s device for conversion tracking and ad measurement.',
  ad_user_data:
    'Controls whether user data (like email or phone) can be sent to Google for advertising purposes such as Customer Match.',
  ad_personalization:
    'Controls whether Google can use visitor data to show them personalised ads, including remarketing.',
  personalization_storage:
    'Controls storage used for site personalisation features like recommendations and preferences.',
  functionality_storage:
    'Controls storage for site functionality such as language settings and UI preferences.',
  security_storage:
    'Controls storage for security features like authentication tokens and fraud prevention.',
  quality_index:
    'A score from 0–100 reflecting how well your Consent Mode setup follows best practices for privacy compliance and data quality.',
};

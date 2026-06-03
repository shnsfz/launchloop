export const READINESS_RULES = [
  {
    id: 'product-readme',
    title: 'README exists',
    weight: 8,
    area: 'Product Clarity',
    severity: 'warning',
    evaluate: (scan) => scan.files['README.md'],
    message: 'README.md is missing. Add a short product description, target user, quick start, and public launch notes.',
    recommendation: 'Create README.md with: problem, audience, outcome, setup, screenshots, and support channel.'
  },
  {
    id: 'value-proposition',
    title: 'Value proposition is detectable',
    weight: 8,
    area: 'Product Clarity',
    severity: 'warning',
    evaluate: (scan) => scan.content.keywords.valueProp || scan.content.keywords.cta,
    message: 'LaunchLoop could not detect a clear value proposition or CTA in the scanned content.',
    recommendation: 'Add a landing section that states: who it is for, what pain it solves, and what result users get.'
  },
  {
    id: 'pricing-path',
    title: 'Pricing or billing path exists',
    weight: 10,
    area: 'Revenue Readiness',
    severity: 'blocker',
    evaluate: (scan) => scan.routes.discovered.includes('/pricing') || scan.content.keywords.pricing || scan.integrations.stripe || scan.integrations.paddle || scan.integrations.lemonSqueezy,
    message: 'No pricing, billing, or checkout path was detected.',
    recommendation: 'Add a /pricing route or a clear paid-plan boundary, even if the first version only collects interest.'
  },
  {
    id: 'auth-path',
    title: 'Auth path exists',
    weight: 8,
    area: 'User Access',
    severity: 'warning',
    evaluate: (scan) => scan.routes.discovered.includes('/login') || scan.routes.discovered.includes('/signup') || scan.content.keywords.auth || scan.integrations.clerk || scan.integrations.nextAuth || scan.integrations.supabase,
    message: 'No login or signup path was detected.',
    recommendation: 'Add a basic auth path or document why the product is usable without accounts.'
  },
  {
    id: 'onboarding-path',
    title: 'Onboarding path exists',
    weight: 7,
    area: 'Activation',
    severity: 'warning',
    evaluate: (scan) => scan.routes.discovered.includes('/dashboard') || scan.routes.discovered.includes('/onboarding') || scan.content.keywords.onboarding,
    message: 'No onboarding, dashboard, or first-run path was detected.',
    recommendation: 'After signup, route users to a first-run page that helps them create or experience the first unit of value.'
  },
  {
    id: 'env-example',
    title: 'Environment variables are documented',
    weight: 10,
    area: 'Deployment',
    severity: 'blocker',
    evaluate: (scan) => scan.env.examples.length > 0,
    message: 'No .env.example or .env.template file was detected.',
    recommendation: 'Add .env.example with all required production keys but no real secrets.'
  },
  {
    id: 'deployment-config',
    title: 'Deployment path is documented or configured',
    weight: 7,
    area: 'Deployment',
    severity: 'warning',
    evaluate: (scan) => scan.files['vercel.json'] || scan.files['netlify.toml'] || scan.files['Dockerfile'] || scan.files['docker-compose.yml'] || hasScript(scan, 'build'),
    message: 'No explicit deployment config or build script was detected.',
    recommendation: 'Add a build script and deployment notes for Vercel, Netlify, Docker, or your target platform.'
  },
  {
    id: 'analytics-events',
    title: 'Analytics is present',
    weight: 8,
    area: 'Observability',
    severity: 'warning',
    evaluate: (scan) => scan.content.keywords.analytics || scan.integrations.posthog || scan.integrations.plausible,
    message: 'No analytics integration or event tracking was detected.',
    recommendation: 'Track primary CTA click, signup completion, activation, and paid conversion events.'
  },
  {
    id: 'error-monitoring',
    title: 'Error monitoring is present',
    weight: 6,
    area: 'Observability',
    severity: 'warning',
    evaluate: (scan) => scan.content.keywords.errorMonitoring || scan.integrations.sentry,
    message: 'No error monitoring or error boundary was detected.',
    recommendation: 'Add an error boundary and connect Sentry, Rollbar, Bugsnag, or an equivalent error-reporting path.'
  },
  {
    id: 'support-channel',
    title: 'Support or feedback channel exists',
    weight: 6,
    area: 'Support',
    severity: 'warning',
    evaluate: (scan) => scan.content.keywords.support || scan.files['.github/ISSUE_TEMPLATE/bug_report.md'] || scan.files['.github/ISSUE_TEMPLATE/feature_request.md'],
    message: 'No support, feedback, or issue intake channel was detected.',
    recommendation: 'Add support email, feedback link, Discord, GitHub issue templates, or in-app feedback.'
  },
  {
    id: 'legal-basics',
    title: 'Legal basics exist',
    weight: 6,
    area: 'Trust',
    severity: 'warning',
    evaluate: (scan) => scan.files['privacy.md'] || scan.files['terms.md'] || scan.content.keywords.legal,
    message: 'Privacy policy or terms were not detected.',
    recommendation: 'Add basic privacy and terms pages before collecting user accounts, emails, analytics, or payment data.'
  },
  {
    id: 'secret-hygiene',
    title: 'No unignored .env files detected in project root',
    weight: 8,
    area: 'AI Coding Safety',
    severity: 'blocker',
    evaluate: (scan) => scan.env.committedEnvFiles.length === 0,
    message: 'A root .env-style file was detected without an ignore rule. LaunchLoop did not read it during scanning, but it is a safety risk for AI coding tasks.',
    recommendation: 'Keep real .env files ignored by git and use .env.example for documentation.'
  },
  {
    id: 'test-script',
    title: 'Test command exists',
    weight: 4,
    area: 'Validation',
    severity: 'warning',
    evaluate: (scan) => hasScript(scan, 'test'),
    message: 'No npm test script was detected.',
    recommendation: 'Add a test script or document a validation command in .launchloop/config.json.'
  },
  {
    id: 'build-script',
    title: 'Build command exists',
    weight: 4,
    area: 'Validation',
    severity: 'warning',
    evaluate: (scan) => hasScript(scan, 'build'),
    message: 'No npm build script was detected.',
    recommendation: 'Add a build script so coding agents and CI can validate production readiness.'
  }
];

function hasScript(scan, name) {
  return Boolean(scan.packageJson?.scripts?.[name]);
}

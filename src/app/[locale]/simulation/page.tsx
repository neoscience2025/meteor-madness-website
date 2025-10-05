import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  'menu',
  'footer',
  'seo/simulation'
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/simulation");
}

export default async function Simulation({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🌌 Simulation</h1>
      <p>Asteroid impact simulation coming soon!</p>
    </div>
  </TranslationsProvider>
}
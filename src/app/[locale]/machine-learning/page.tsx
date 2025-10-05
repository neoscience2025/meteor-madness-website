import TranslationsProvider from "../../../components/translation-provider";
import initTranslations from "../../i18n/index";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  'menu',
  'footer',
  'seo/machine-learning'
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/machine-learning");
}

export default async function MachineLearning({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🤖 Machine Learning</h1>
      <p>AI-powered asteroid detection coming soon!</p>
    </div>
  </TranslationsProvider>
}
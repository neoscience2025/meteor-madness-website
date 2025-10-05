import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import News from "@/components/News";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  "news","seo/news"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/news");
}

export default async function NewsOfWeek({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <News />
    
  </TranslationsProvider>
}

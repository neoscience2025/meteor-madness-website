import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import News from "@/components/News";


const NAMESPACES_REQUIRED = [
  "news"
];

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

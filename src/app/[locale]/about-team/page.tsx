import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import OurTeam from "@/components/OurTeam";
import AboutProject from "@/components/OurProyect";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  "team","aboutProject","seo/about-team"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/about-team");
}

export default async function Home({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <OurTeam />
    <AboutProject />
  </TranslationsProvider>
}

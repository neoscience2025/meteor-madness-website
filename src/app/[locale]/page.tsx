import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "../i18n";
import Banner from "@/components/Banner";
import MottosSection from "@/components/MottosSection";
import OurTeam from "@/components/OurTeam";
import PreviewSection from "@/components/PreviewSection";


const NAMESPACES_REQUIRED = [
  "team"
];

export default async function Home({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <main>
      <Banner />
      <MottosSection />
      <OurTeam />
      <PreviewSection />
    </main>

  </TranslationsProvider>
}

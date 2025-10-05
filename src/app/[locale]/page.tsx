import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "../i18n";
import Banner from "@/components/Banner";
import MottosSection from "@/components/MottosSection";
import OurTeam from "@/components/OurTeam";
import PreviewSection from "@/components/PreviewSection";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  "team","preview","seo/home"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/home");
}

export default async function Home({ params }) {
  const { locale } = await params;
  const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <Banner />
    <MottosSection />
    <OurTeam />
    <PreviewSection />
  </TranslationsProvider>
}

import { Map } from "@/components/impactZone/Map";
import TranslationsProvider from "../../../components/translation-provider";
import initTranslations from "../../i18n/index";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  "impactZone",
  "seo/impact-zone",
  "impactSummary"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/impact-zone");
}

export default async function ImpactZone({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <div className="container mx-auto px-4 py-8 pt-20 " >
      <h1 className="text-3xl font-bold mb-4">💥 Impact Zone</h1>
      <Map />
    </div>
  </TranslationsProvider>
}
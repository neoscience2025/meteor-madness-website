import { Map } from "@/components/impactZone/Map";
import TranslationsProvider from "../../../components/translation-provider";
import initTranslations from "../../i18n/index";
import { getMetadata } from "@/lib/seo";
import { Suspense } from "react";

const NAMESPACES_REQUIRED = [
  "impactZone",
  "seo/impact-zone",
  "impactSummary",
  "menu"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/impact-zone");
}

export default async function ImpactZone({ params, searchParams }: { 
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const urlParams = await searchParams;
  const { t, resources } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
    <div className="container mx-auto px-4 py-8 pt-20 " >
      <h1 className="text-3xl font-bold mb-4">{t("menu:impact")}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Map initialParams={urlParams} />
      </Suspense>
    </div>
  </TranslationsProvider>
}
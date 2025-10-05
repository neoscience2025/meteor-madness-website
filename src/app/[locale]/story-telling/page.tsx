import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import Banner from "@/components/Banner";
import MottosSection from "@/components/MottosSection";
import OurTeam from "@/components/OurTeam";
import PreviewSection from "@/components/PreviewSection";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
    "team","seo/story-telling"
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/story-telling");
}

export default async function StoryTelling({ params }) {
    const { locale } = await params;
    const { t, resources, } = await initTranslations(locale, NAMESPACES_REQUIRED);

    return <TranslationsProvider
        namespaces={NAMESPACES_REQUIRED}
        locale={locale}
        resources={resources}
    >
        aqui va el libro
    </TranslationsProvider>
}

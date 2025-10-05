import TranslationsProvider from "@/components/translation-provider";
import initTranslations from "@/app/i18n";
import StoryPlayer from "@/components/StoryPlayer";

import { getMetadata } from "@/lib/seo";
import InteractiveBook from "@/components/book/InteractiveBook";
import bookData from "@/app/i18n/locales/es/book.json";

const NAMESPACES_REQUIRED = [
    "menu",
    "team",
    "seo/story-telling"
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
        <div className="container mx-auto px-4 py-8 pt-20 ">
            <h1 className="text-3xl font-bold mb-4">{t("menu:storyTelling")}</h1>
            <InteractiveBook bookData={bookData} />
        </div>
    </TranslationsProvider>
}

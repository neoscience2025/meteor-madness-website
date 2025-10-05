import TranslationsProvider from "../../../components/translation-provider";
import GameComponent from "../../../components/game/Game";
import initTranslations from "../../i18n/index";
import { getMetadata } from "@/lib/seo";

const NAMESPACES_REQUIRED = [
  'menu',
  'footer',
  'seo/game',
  'game'
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return await getMetadata(locale, "seo/game");
}

export default async function GamePage({ params }) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, NAMESPACES_REQUIRED);

  return <TranslationsProvider
    namespaces={NAMESPACES_REQUIRED}
    locale={locale}
    resources={resources}
  >
       <main className="min-h-screen bg-black pt-20 md:pt-12">
        <GameComponent />
      </main>
  </TranslationsProvider>
}
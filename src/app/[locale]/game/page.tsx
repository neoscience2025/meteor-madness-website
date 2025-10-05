import TranslationsProvider from "../../../components/translation-provider";
import GameComponent from "../../../components/game/Game";
import initTranslations from "../../i18n/index";

const NAMESPACES_REQUIRED = [
  'menu',
  'footer',
  'game'
];

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
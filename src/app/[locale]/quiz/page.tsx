import TranslationsProvider from "../../../components/translation-provider";
import QuizMeteorMadness from "../../../components/QuizMeteorMadness";
import initTranslations from "../../i18n/index";

const NAMESPACES_REQUIRED = [
  'quiz'
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
        <QuizMeteorMadness />
      </main>
  </TranslationsProvider>
}

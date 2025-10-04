"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { RiLinkedinFill } from "react-icons/ri";
import { FiChevronRight, FiRefreshCw, FiCheck, FiX } from "react-icons/fi";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

/* ======== Estilos base (oscuro elegante) ======== */
const CARD_BG =
  "bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-slate-950/85 backdrop-blur-sm";

/* ======== Tipos y datos ======== */
type Q = {
  id: string;
  question: string;
  options: string[];
  answerIdx: number;
};

const QUESTIONS: Q[] = [
  { id: "q1", question: "¿Qué significa NEO en astronomía?", options: ["Near Earth Orbit", "Near Earth Object", "New Earth Observation"], answerIdx: 1 },
  { id: "q2", question: "Objetivo principal del reto Meteor Madness:", options: ["Construir cohetes", "Convertir datos abiertos de NEOs en decisiones y educación", "Crear NFTs"], answerIdx: 1 },
  { id: "q3", question: "API de NASA para consultar NEOs por fecha:", options: ["EPIC", "NEO Feed", "EONET"], answerIdx: 1 },
  { id: "q4", question: "Magnitud usada para estimar tamaño/energía:", options: ["Índice UV", "Magnitud absoluta H", "Paralaje anual"], answerIdx: 1 },
  { id: "q5", question: "¿Qué busca el reto con simulaciones de impacto?", options: ["Gráficas artísticas", "Modelar escenarios 'what-if'", "Aumentar visitas"], answerIdx: 1 },
  { id: "q6", question: "Misión que probó desviar un asteroide:", options: ["OSIRIS-REx", "DART", "JUNO", "Voyager"], answerIdx: 1 },
  { id: "q7", question: "Requisito de la app según el reto:", options: ["Excel", "Visualizar trayectorias en tiempo real", "3D obligatorio"], answerIdx: 1 },
  { id: "q8", question: "Rol del componente educativo:", options: ["Hacer astronautas", "Comunicar riesgos de forma clara", "Cumplir copyright"], answerIdx: 1 },
  { id: "q9", question: "¿Cuál NO es estrategia de defensa planetaria?", options: ["Desviación gravitacional", "Impacto cinético", "Explosión nuclear"], answerIdx: 1 },
  { id: "q10", question: "¿Por qué importa desarrollar soluciones sobre NEOs?", options: ["Vender telescopios", "Videojuegos", "Prevenir desinformación y preparar a la sociedad"], answerIdx: 2 },
];

const PASS_SCORE = 70;
const POINTS_PER_Q = 10;

/* ======== Utils ======== */
function calcScore(answers: Record<string, number | null>) {
  const correct = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.answerIdx ? 1 : 0), 0);
  return correct * POINTS_PER_Q;
}
function addUtm(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "neoscience");
    u.searchParams.set("utm_medium", "share");
    u.searchParams.set("utm_campaign", "quiz");
    return u.toString();
  } catch {
    return url;
  }
}
const shareLinksFor = (score: number, link: string) => {
  const url = addUtm(link);
  const enc = encodeURIComponent;
  const isPassed = score >= PASS_SCORE;
  const fullMessage = isPassed
    ? `¡Desafío Superado! 🚀 Acabo de completar el Quiz Meteor Madness de NeoScience y logré ${score}/100. ¡Aceptá el reto! #NeoScience #NasaSpaceAppChallenge`
    : `Completé el Quiz Meteor Madness de NeoScience con ${score}/100 💫. ¡Aprendé sobre defensa planetaria! #NeoScience #NasaSpaceAppChallenge`;
  return { linkedin: `https://www.linkedin.com/share?text=${enc(fullMessage)}${enc(url ? "\n\n": "")}` };
};

/* ======== Subcomponentes ======== */
const Letter = ({ i }: { i: number }) => {
  const letters = ["A", "B", "C", "D", "E", "F"];
  return (
    <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
      {letters[i] ?? "·"}
    </span>
  );
};

interface QuestionCardProps {
  question: Q;
  qIndex: number;
  totalQuestions: number;
  chosenAnswer: number | null;
  onSelect: (qid: string, idx: number) => void;
  showFeedback: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  qIndex,
  totalQuestions,
  chosenAnswer,
  onSelect,
  showFeedback,
}) => {
  const correct = question.answerIdx;

  return (
    <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
      <article className={`rounded-2xl p-6 ${CARD_BG} border border-white/8 min-h-[300px]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-extrabold text-xl">
            {qIndex + 1}/{totalQuestions}. {question.question}
          </h3>
        </div>

        <div className="grid gap-3">
          {question.options.map((opt, idx) => {
            const isSelected = chosenAnswer === idx;
            const isCorrect = showFeedback && idx === correct;
            const isWrong = showFeedback && isSelected && idx !== correct;
            const isDisabled = showFeedback;

            return (
              <button
                key={idx}
                onClick={() => onSelect(question.id, idx)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={[
                  "group w-full text-left px-4 py-3 rounded-xl border transition duration-200 flex items-center justify-between gap-3",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                  !isSelected && !showFeedback && "border-white/10 hover:border-white/20 hover:bg-white/5",
                  isSelected && !showFeedback && "border-cyan-400/60 bg-cyan-400/10",
                  isCorrect && "border-emerald-400 bg-emerald-400/10",
                  isWrong && "border-rose-400 bg-rose-400/10",
                  !isSelected && !isCorrect && showFeedback && "opacity-60",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center gap-3">
                  <Letter i={idx} />
                  <span className="text-white">{opt}</span>
                </div>

                {showFeedback && isCorrect && (
                  <FiCheck className="text-emerald-300 shrink-0" size={18} />
                )}
                {showFeedback && isWrong && <FiX className="text-rose-300 shrink-0" size={18} />}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <p
            className={[
              "mt-4 text-sm font-medium p-3 rounded-lg border",
              chosenAnswer === correct
                ? "text-emerald-300 border-emerald-400/60 bg-emerald-950/40"
                : "text-rose-300 border-rose-400/60 bg-rose-950/40",
            ].join(" ")}
          >
            {chosenAnswer === correct
              ? "¡Correcto! 🚀"
              : "Respuesta incorrecta. La opción correcta está marcada en verde."}
          </p>
        )}
      </article>
    </div>
  );
};

/* ======== Componente principal ======== */
export default function QuizMeteorMadness() {
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null])),
  );
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const upd = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const onSelect = (qid: string, idx: number) => {
    if (answers[qid] === null) setAnswers((a) => ({ ...a, [qid]: idx }));
  };

  const handleNext = () => {
    if (currentQIndex === QUESTIONS.length - 1) {
      submit();
    } else {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const submit = () => {
    const finalScore = calcScore(answers);
    setScore(finalScore);
    setSubmitted(true);
    if (finalScore >= PASS_SCORE) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const reset = () => {
    setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, null])));
    setCurrentQIndex(0);
    setSubmitted(false);
    setScore(0);
    setShowConfetti(false);
  };

  const currentShareUrl = useMemo(() => {
    let base = (typeof window !== "undefined" ? window.location.href : "https://neoscience.app/quiz") || "";
    try {
      const u = new URL(base);
      u.searchParams.set("quiz_score", String(score));
      base = u.toString();
    } catch {}
    return base;
  }, [score]);

  const share = async () => {
    const url = currentShareUrl;
    const links = shareLinksFor(score, url);
    window.open(links.linkedin, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const currentQuestion = QUESTIONS[currentQIndex];
  const chosenAnswer = answers[currentQuestion.id];
  const isAnswered = chosenAnswer !== null;

  /* ======== Resultado ======== */
  if (submitted) {
    const message =
      score >= PASS_SCORE
        ? `🎉 ¡Victoria! Lograste ${score}/100 en NeoScience.`
        : `💪 Buen esfuerzo, lograste ${score}/100. ¡Volvé a intentarlo!`;

    return (
      <section className="max-w-xl mx-auto px-4 py-10 text-center min-h-screen flex flex-col justify-center">
        {showConfetti && <Confetti width={windowSize.w} height={windowSize.h} numberOfPieces={260} recycle={false} />}

        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
          <div className={`rounded-2xl p-8 ${CARD_BG} border border-white/8`}>
            <h2 className="text-4xl font-extrabold text-white mb-2">Resultado Final</h2>
            <p className="text-white/80 text-lg mb-6">{message}</p>

            <div className="flex flex-col gap-4">
              <button
                onClick={share}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A66C2] text-white font-semibold hover:brightness-110 transition"
                title="Compartir en LinkedIn"
              >
                <RiLinkedinFill size={20} />
                Compartir mi puntaje ({score}/100)
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 border border-white/10 transition"
              >
                <FiRefreshCw size={18} />
                Reintentar Quiz
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ======== Quiz ======== */
  const progress = Math.round(((currentQIndex + 1) / QUESTIONS.length) * 100);

  return (
    <section className="max-w-xl mx-auto px-4 py-10 min-h-screen flex flex-col justify-center">
      <header className="mb-6">
     
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3"> NEO Quiz</h2>
        <p className="text-white/70 mt-1">
          Pregunta <span className="font-semibold text-cyan-300">{currentQIndex + 1}</span> de {QUESTIONS.length}.{" "}
          Puntaje: {calcScore(answers)}/100
        </p>

        {/* barra progreso */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-white/60">{progress}%</div>
        </div>
      </header>

      <QuestionCard
        question={currentQuestion}
        qIndex={currentQIndex}
        totalQuestions={QUESTIONS.length}
        chosenAnswer={chosenAnswer}
        onSelect={onSelect}
        showFeedback={isAnswered}
      />

      {/* Botón Siguiente/Finalizar */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:opacity-50 transition"
        >
          {currentQIndex === QUESTIONS.length - 1 ? "Finalizar Quiz" : "Siguiente Pregunta"}
          <FiChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Orbitron } from "next/font/google";
import { useTranslation } from "react-i18next";

// Fuente
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Timings (puedes moverlos al JSON si querés)
const STAGGER = 1.0;  // 1s entre línea y línea
const IN_DUR = 1.0;   // cada línea tarda 1s en aparecer
const HOLD = 2.5;     // bloque completo se queda 2.5s
const OUT_DUR = 1.0;  // salida suave de 1s

// Variants
const blockVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: STAGGER },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: OUT_DUR, ease: [0.22, 1, 0.36, 1] },
  },
};

// Nota: si TS se queja por "filter", deja el `as any`.
const lineVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" as any },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)" as any,
    transition: { duration: IN_DUR, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MottosStaggerLoop() {
  const { t } = useTranslation("preview");

  // 🔥 Traemos frases desde el JSON
  const phrases = (t("phrases", { returnObjects: true }) as string[]) ?? [];
  const ariaLabel = t("ariaLabel", { defaultValue: "Intro stagger loop" });

  // Evita crash si no hay frases
  const safePhrases = useMemo(
    () => (Array.isArray(phrases) && phrases.length ? phrases : ["…"]),
    [phrases]
  );

  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // tiempo total de un ciclo
    const total = (safePhrases.length - 1) * STAGGER + IN_DUR + HOLD + OUT_DUR + 0.2;
    const tmr = setTimeout(() => setCycle((c) => c + 1), total * 1000);
    return () => clearTimeout(tmr);
  }, [cycle, safePhrases.length]);

  return (
    <section
      aria-label={ariaLabel}
      style={{
        width: "100%",
        minHeight: "28vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "4vh 0",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% -40%, #03071aff 0%, #000 55%, #000 100%)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: orbitron.style.fontFamily,
          fontWeight: 700,
          letterSpacing: "0.06em",
          lineHeight: 1.18,
          fontSize: "clamp(20px, 3.2vw, 30px)",
          textShadow: "0 0 22px rgba(0, 132, 255, 0.25)",
          padding: "0 16px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cycle}
            variants={blockVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {safePhrases.map((line) => (
              <motion.p
                key={`${cycle}-${line}`}
                variants={lineVariants}
                style={{
                  margin: 0,
                  background:
                    "linear-gradient(90deg,#b6dcff 0%,#ffffff 35%,#9ad1ff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "pre-wrap",
                }}
              >
                {line}
              </motion.p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

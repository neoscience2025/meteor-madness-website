"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["600","700"], display: "swap" });

const PHRASES = [
  "Defend, Save and Celebrate",
  "Saving the Earth is in your hands, and don't forget...",
  "Together we protect our world",
];

const LOGO_SRC  = "/preview/logo.PNG";
const LOGO_SIZE = 200;

// Timings
const STAGGER = 1.0, IN_DUR = 1.0, HOLD = 2.5, OUT_DUR = 1.0;

const blockVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: STAGGER } },
  exit:  { opacity: 0, y: -12, transition: { duration: OUT_DUR, ease: [0.22,1,0.36,1] } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" as any },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)" as any, transition: { duration: IN_DUR, ease: [0.22,1,0.36,1] } },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(4px)" as any },
  show:   { opacity: 1, scale: 1,   filter: "blur(0px)" as any, transition: { duration: 0.8, ease: [0.22,1,0.36,1] } },
};

export default function MottosStaggerLoop() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const total = (PHRASES.length) * STAGGER + IN_DUR + HOLD + OUT_DUR + 0.2;
    const t = setTimeout(() => setCycle(c => c + 1), total * 1000);
    return () => clearTimeout(t);
  }, [cycle]);

  return (
    <section
      aria-label="Intro stagger loop"
      style={{
        width: "100%",
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6vh 0 8h",
        overflow: "visible",
        background: "radial-gradient(circle at 50% -40%, #181a03ff 0%, #000 55%, #000 100%)",
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
          textShadow: "0 0 22px rgba(65,203,47,0.25)",
          padding: "0 16px",
          maxWidth: 1100,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cycle}
            variants={blockVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
          >
            {/* Frases */}
            {PHRASES.map((t) => (
              <motion.p
                key={t}
                variants={lineVariants}
                style={{
                  margin: 0,
                  background: "linear-gradient(90deg,#b6dcff 0%,#ffffff 35%,#9ad1ff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  whiteSpace: "pre-wrap",
                }}
              >
                {t}
              </motion.p>
            ))}

            {/* Logo como último hijo, aparece después del texto */}
            {LOGO_SRC && (
              <motion.img
                variants={logoVariants}
                src={LOGO_SRC}
                alt="NeoScience logo"
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                style={{
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                  objectFit: "cover",
                  borderRadius: "50%",
                  boxShadow: "0 0 40px rgba(0,166,255,.45)",
                  marginTop: 20,  // 👈 espacio entre frases y logo
                  display: "block",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

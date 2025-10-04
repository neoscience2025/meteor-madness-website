"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { Orbitron } from "next/font/google";
import Image from "next/image";
import { useTranslation } from "react-i18next";

// Fuente sci-fi para títulos / nombres
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// =====================
// Tipos + Datos ejemplo
// =====================
export type Member = {
  name: string;
  profession: string; // Ej: "Software Engineer"
  role: string;       // Ej: "Frontend / UI"
  photo: string;      // URL absoluta o /public/*
  linkedin: string;   // URL perfil LinkedIn
};

// =====================
// Animaciones (Variants)
// =====================

// Container muy leve (opcional)
const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05 },
  },
};

// Tarjeta con delay por índice (entra una por una)
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" as any },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)" as any,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.15, // ⬅️ escalonado por índice
    },
  }),
};

// =====================
// Icono LinkedIn inline
// =====================
function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M19 3A2.94 2.94 0 0 1 22 6v12a2.94 2.94 0 0 1-3 3H5a2.94 2.94 0 0 1-3-3V6a2.94 2.94 0 0 1 3-3h14m-9.5 7.5H7V19h2.5v-8.5M8.25 5.75A1.25 1.25 0 1 0 9.5 7a1.25 1.25 0 0 0-1.25-1.25M19 19v-4.75c0-2.37-1.26-3.75-3.28-3.75a2.84 2.84 0 0 0-2.56 1.4h-.05V10.5H10.7V19h2.45v-4.45c0-1.18.22-2.32 1.69-2.32s1.5 1.31 1.5 2.41V19Z"
      />
    </svg>
  );
}

// =====================
// Componente principal
// =====================
export default function OurTeam({
  title = "Our Team",
  subtitle = "People behind Neoscience",
}: {
  title?: string;
  subtitle?: string;
}) {
  const colors = useMemo(
    () => ({
      card: "rgba(7, 20, 35, 0.8)",
      stroke: "rgba(0, 166, 255, 0.28)",
      glow: "0 0 24px rgba(0, 166, 255, 0.25)",
      text: "#e6f4ff",
      accentFrom: "#9ad1ff",
      accentTo: "#bfe6ff",
      titleColor: "#38f6e7", // color distinto para el título
      titleGlow: "0 0 28px rgba(56,246,231,0.45)",
    }),
    []
  );

  const { t } = useTranslation();

  const team: Member[] = t("team:members", { returnObjects: true }) as Member[];

  return (
    <section
      aria-label="Our Team"
      style={{
        width: "100%",
        padding: "64px 16px 72px",
        background:
          "radial-gradient(circle at 50% -40%, #03071aff 0%, #000 55%, #000 100%)",
        color: colors.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto 28px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: orbitron.style.fontFamily,
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            lineHeight: 1.1,
            color: "#176b70ff", // 👈 color sólido diferente (violeta espacial)
            textShadow: "0 0 24px rgba(3, 57, 70, 0.28)", // glow en tono violeta
          }}
        >
          {title}
        </h2>
        <p
          style={{
            marginTop: 8,
            opacity: 0.85,
            fontSize: "clamp(14px, 2.2vw, 16px)",
          }}
        >

        </p>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          
          gap: 18,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))", // ⬅️ tres por fila
        }}
      >
        {team.map((m, i) => (
          <motion.article
            key={m.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{
              y: -6,
              rotateX: -2, // tilt suave
              rotateY: 2,
              boxShadow:
                "0 10px 30px rgba(0, 166, 255, 0.18), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              position: "relative",
              borderRadius: 16,
              padding: 1,
              background:
                "linear-gradient(135deg, rgba(0,166,255,0.35), rgba(255,255,255,0.06))",
              overflow: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Inner card */}
            <div
              style={{
                borderRadius: 16,
                background: colors.card,
                border: `1px solid ${colors.stroke}`,
                padding: 16,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                backdropFilter: "blur(6px)",
              }}
            >
              {/* Foto */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.2/1",
                  borderRadius: 12,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.4))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Image
                  src={m.photo}
                  alt={`${m.name} photo`}
                  fill
                  className="object-cover"
                  style={{
                    filter: "saturate(0.9) contrast(1.05)",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: orbitron.style.fontFamily,
                    fontSize: "clamp(16px, 2.5vw, 18px)",
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                  }}
                >
                  {m.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.profession}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    opacity: 0.85,
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,166,255,0.32)",
                      background:
                        "linear-gradient(90deg, rgba(0,166,255,0.12), rgba(0,166,255,0.06))",
                      boxShadow: "0 0 18px rgba(0,166,255,0.12) inset",
                    }}
                  >
                    {m.role}
                  </span>
                </p>
              </div>

              {/* LinkedIn */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${m.name} LinkedIn`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: "#bfe6ff",
                    textDecoration: "none",
                  }}
                >
                  <LinkedInIcon width={18} height={18} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Glow suave de fondo */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -40,
                background:
                  "radial-gradient(600px 160px at 50% 100%, rgba(0,166,255,0.16), transparent 60%)",
                pointerEvents: "none",
              }}
            />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

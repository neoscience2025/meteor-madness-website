"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { Orbitron } from "next/font/google";
import Image from "next/image";
import { useTranslation } from "react-i18next";

// =====================
// Config general
// =====================
const orbitron = Orbitron({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });

// Ancho fijo para TODAS las tarjetas (ajusta si querés)
const CARD_W = 350; // cabe 3x en 1100px (350*3 + 2*24gap ≈ 1098)

// =====================
// Tipos
// =====================
export type Member = {
  name: string;
  profession: string;
  role: string;
  photo: string;
  linkedin: string;
};

type UIBlock = {
  ourTeamTitle: string;
  ourTeamSubtitle: string;

};

// =====================
// Animaciones
// =====================
const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" as any },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)" as any,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 },
  }),
};

// =====================
// Icono LinkedIn
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
// Tarjeta
// =====================
function MemberCard({ m, i, colors }: { m: Member; i: number; colors: any }) {
  return (
   <motion.article
  style={{
    width: CARD_W,
    position: "relative",
    borderRadius: 18,
    padding: 2, // un poco más grueso para destacar el borde
    background:
      "linear-gradient(135deg, rgba(0,150,255,0.6), rgba(0,210,255,0.2))", // borde azul más consistente
    boxShadow: "0 0 12px rgba(0,166,255,0.35)", // brillo parejo
    overflow: "hidden",
    transformStyle: "preserve-3d",
  }}
>
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
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06)",
             border: "1px solid rgba(0,166,255,0.4)", // 👈 color igual que el exterior
          }}
        >
          <Image
            src={m.photo}
            alt={`${m.name} photo`}
            fill
            className="object-cover"
            style={{ filter: "saturate(0.9) contrast(1.05)" }}
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
          <p style={{ margin: 0, opacity: 0.9, fontSize: 14, letterSpacing: "0.02em" }}>
            {m.profession}
          </p>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
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
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
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

      {/* Glow */}
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
      text: "#e6f4ff",
    }),
    []
  );

  const { t } = useTranslation();
  const team = (t("team:members", { returnObjects: true }) as Member[]) ?? [];
   const uiMember =
    (t("team:uiMember", { returnObjects: true }) as UIBlock) ??
    ({ ourTeamTitle: "Our Team", ourTeamSubtitle: "People behind Neoscience" } as UIBlock);

  const count = team.length;
  const hasTailPair = count % 3 === 2;
  const head = hasTailPair ? team.slice(0, count - 2) : team;
  const tail = hasTailPair ? team.slice(count - 2) : [];

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
      <div style={{ maxWidth: 1100, margin: "0 auto 28px", textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontFamily: orbitron.style.fontFamily,
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            lineHeight: 1.1,
            color: "#176b70ff",
            textShadow: "0 0 24px rgba(3, 57, 70, 0.28)",
          }}
        >
             {uiMember.ourTeamTitle}
        </h2>
        <p style={{ marginTop: 8, opacity: 0.85, fontSize: "clamp(14px, 2.2vw, 16px)" }}>
         {uiMember.ourTeamSubtitle}
        </p>
      </div>

      {/* Grid principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="
          mx-auto max-w-[1100px]
          grid gap-6
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
          justify-items-center
        "
      >
        {/* primeras filas normales */}
        {head.map((m, i) => (
          <MemberCard key={m.name} m={m} i={i} colors={colors} />
        ))}

        {/* última fila: centrada y del mismo tamaño */}
        {hasTailPair && (
          <div className="hidden lg:flex lg:col-span-3 justify-center gap-6 w-full">
            {tail.map((m, i) => (
              <div key={`tail-${m.name}-${i}`} className="flex-shrink-0">
                <MemberCard m={m} i={head.length + i} colors={colors} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

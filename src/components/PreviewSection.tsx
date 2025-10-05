"use client";

import { motion } from "framer-motion";
import { Orbitron } from "next/font/google";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import MottosEndSection from "@/components/MottosEndSection";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

type PreviewItem = {
  title: string;
  desc: string;
  img: string;
};

export default function PreviewSection() {
  const { t } = useTranslation("preview");

  // 🔥 Traemos todo desde el JSON
  const sectionTitle = t("sectionTitle");
  const sectionSubtitle = t("sectionSubtitle");
  const items = (t("items", { returnObjects: true }) as PreviewItem[]) || [];

  return (
    <section
      style={{
        width: "100%",
        padding: "64px 16px",
        background:
          "radial-gradient(circle at 50% -40%, #03071aff 0%, #000 55%, #000 100%)",
        color: "#e6f4ff",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto 32px", textAlign: "center" }}>
        <h2
          style={{
            margin: 0,
            fontFamily: orbitron.style.fontFamily,
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            lineHeight: 1.1,
            color: "#b1d6f3ff",
            textShadow: "0 0 24px rgba(32, 191, 231, 0.4)",
          }}
        >
          {sectionTitle}
        </h2>
        <p style={{ marginTop: 8, fontSize: "clamp(13px,2vw,15px)", opacity: 0.8 }}>
          {sectionSubtitle}
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        {items.map((item, i) => {
          const textOrder = i % 2 === 0 ? 1 : 2;
          const imageOrder = i % 2 === 0 ? 2 : 1;

          return (
            <motion.div
              key={`${item.title}-${i}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true, amount: 0.2 }}
              style={{
                borderRadius: 14,
                overflow: "hidden",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,166,255,0.18)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                minHeight: 120,
              }}
            >
              {/* Texto */}
              <div
                style={{
                  width: "40%",
                  maxWidth: 320,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: "left",
                  gap: 6,
                  order: textOrder,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-heading), system-ui, sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    opacity: 0.85,
                    lineHeight: 1.4,
                    textAlign: "justify",
                  }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Visual */}
              <div
                style={{
                  width: "60%",
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(45deg,#0b1028,#000)",
                  order: imageOrder,
                  position: "relative",
                }}
              >
                <Image
                  src={item.img}
                  alt={`${item.title} photo`}
                  fill
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "22px",
                    display: "block",
                    filter: "saturate(0.9) contrast(1.05)",
                  }}
                />
                {/* Glow */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -40,
                    pointerEvents: "none",
                    background:
                      "radial-gradient(520px 160px at 50% 100%, rgba(0,166,255,0.15), transparent 60%)",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Global styles for headings */}
      <style jsx global>{`
        .neo-title {
          font-family: var(--font-heading), system-ui, sans-serif;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.1;
          background: linear-gradient(90deg, #00f7ff, #00a6ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 12px rgba(0, 166, 255, 0.25);
        }
        .neo-title--md {
          font-size: clamp(24px, 4vw, 34px);
        }
        .neo-title--lg {
          font-size: clamp(28px, 5vw, 56px);
        }
      `}</style>

      <div style={{ marginTop: "70px" }}>
        <MottosEndSection />
      </div>
    </section>
  );
}

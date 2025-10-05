"use client";

import { Trophy, Rocket, Cpu, Database } from "lucide-react";
import { Orbitron } from "next/font/google";
import { useTranslation } from "react-i18next";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

type LinkItem = { label: string; href: string };
type Items = string[] | LinkItem[];

export default function OurProyect() {
  const { t } = useTranslation("aboutProject");

  return (
    <section
      id="aboutus"
      className="relative py-24 md:py-32 text-white"
      style={{
        width: "100%",
        padding: "64px 16px 72px",
        background:
          "radial-gradient(circle at 50% -40%, #03071aff 0%, #000 55%, #000 100%)",
        fontFamily: orbitron.style.fontFamily,
      }}
    >
      {/* ======= Título principal ======= */}
      <h2
        style={{
          margin: "0 auto 24px",
          textAlign: "center",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 900,
          letterSpacing: "0.05em",
          lineHeight: 1.1,
          color: "#176b70ff",
          textShadow: "0 0 24px rgba(3,57,70,0.28)",
          maxWidth: "min(68rem,92vw)",
        }}
      >
        {t("sectionTitle")}
      </h2>

      {/* ======= Contenedor central ======= */}
      <div className="mx-auto w-[min(68rem,92vw)]">
        {/* ---- Header ---- */}
        <div className="mb-10 flex items-start justify-between gap-6">
          <p className="mt-3 max-w-2xl text-white/80 md:text-justify text-left leading-relaxed break-normal">
            {t("objective")}
          </p>

          <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-yellow-300">{t("badge")}</span>
            </div>
          </div>
        </div>

        {/* ======= Grid principal ======= */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Challenge */}
          <Card>
            <Header icon={<Rocket className="h-5 w-5" />} title={t("challenge.title")} />
            <h4 className="font-semibold text-yellow-200">{t("challenge.subtitle")}</h4>
            <P>{t("challenge.description")}</P>
          </Card>

          {/* Data Sources */}
          <Card>
            <Header icon={<Database className="h-5 w-5" />} title={t("dataSources.title")} />
            <UL items={t("dataSources.items", { returnObjects: true }) as Items} />
          </Card>

          {/* Stack */}
          <Card>
            <Header icon={<Cpu className="h-5 w-5" />} title={t("stack.title")} />
            <UL items={t("stack.items", { returnObjects: true }) as Items} />
          </Card>

          {/* UI/UX */}
          <Card>
            <Header emoji="🎨" title={t("uiux.title")} />
            <UL items={t("uiux.items", { returnObjects: true }) as Items} />
          </Card>

          {/* Methodology */}
          <Card>
            <Header emoji="📋" title={t("methodology.title")} />
            <UL items={t("methodology.items", { returnObjects: true }) as Items} />
          </Card>

          {/* Impact */}
          <Card>
            <Header emoji="🌍" title={t("impact.title")} />
            <UL items={t("impact.items", { returnObjects: true }) as Items} />
          </Card>
        </div>

        {/* ======= CTA final ======= */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/15 to-purple-600/15 p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h5 className="text-lg font-semibold">{t("comments.title")}</h5>
              <p className="text-white/80 text-sm">{t("comments.description")}</p>
            </div>
            <a
              href={t("comments.mailto")}
              className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur hover:bg-white/25 transition"
            >
              {t("comments.button")}
            </a>
          </div>
        </div>
      </div>

      {/* ======= Fuente global ======= */}
      <style jsx>{`
        #aboutus * {
          font-family: inherit !important;
        }
      `}</style>
    </section>
  );
}

/* ===== Subcomponentes UI ===== */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
      {children}
    </div>
  );
}

function Header({
  icon,
  emoji,
  title,
}: {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon ?? <span className="text-cyan-300">{emoji}</span>}
      <h4 className="font-semibold">{title}</h4>
    </div>
  );
}

function UL({ items }: { items?: Items }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const isLinkArray = typeof (items as any)[0] === "object";

  return (
    <ul className="space-y-2 text-sm text-white/80">
      {isLinkArray
        ? (items as LinkItem[]).map((it) => (
            <li key={it.label}>
              •{" "}
              <a href={it.href} target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                {it.label}
              </a>
            </li>
          ))
        : (items as string[]).map((it) => <li key={it}>• {it}</li>)}
    </ul>
  );
}

function P({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-white/80 text-sm leading-relaxed md:text-justify">{children}</p>;
}

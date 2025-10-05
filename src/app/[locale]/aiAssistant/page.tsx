"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

/* ───────────────── Types ───────────────── */
type Role = "user" | "assistant" | "system";
type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  ts: number; // Unix ms
};

/* ───────────────── Utils ───────────────── */
const uid = () => Math.random().toString(36).slice(2);

// ⚠️ Forzamos locale para evitar mismatch de SSR vs client
const timeLabel = (ts: number, locale: string) =>
  new Date(ts).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

/* ───────────────── Page ───────────────── */
export default function AiAssistantPage() {
  const params = useParams<{ locale: string }>();
  // Locale activo según la ruta /[locale]/...
  const routeLocale = (params?.locale || "es") as "es" | "en";
  const dateLocale = routeLocale === "en" ? "en-US" : "es-ES";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "system",
      content:
        "🚀 Bienvenido a NeoScience Chatbot. Preguntame sobre NEOs, asteroides y defensa planetaria.",
      ts: Date.now(), // ✅ siempre timestamp
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [model, setModel] = useState("neoscience-sim");
  const [lang, setLang] = useState<"es" | "en">(routeLocale);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Prompts rápidos
  const quickPrompts = useMemo(
    () => [
      "¿Qué es un NEO y por qué importa?",
      "Muestra un ejemplo de trayectoria simulada",
      "Explica el flujo de mitigación de riesgo",
      "Genera un quiz sobre meteoroides",
    ],
    []
  );

  /* ──────────── Send ──────────── */
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      ts: Date.now(), // ✅
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [...messages, userMsg].map(({ id, ...m }) => m), // sin id
          model,
          lang,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content:
          typeof data?.reply === "string" && data.reply.length
            ? data.reply
            : "No hubo respuesta del modelo.",
        ts: Date.now(), // ✅
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content:
          "⚠️ Error: no se pudo conectar con el backend. Revisá /api/chat o la consola.",
        ts: Date.now(), // ✅
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSending(false);
    }
  }

  /* ──────────── Reset ──────────── */
  function handleReset() {
    setMessages([
      {
        id: uid(),
        role: "system",
        content:
          "🌀 Nuevo chat iniciado. Preguntá sobre asteroides, defensa planetaria o NEOs.",
        ts: Date.now(), // ✅
      },
    ]);
    setInput("");
  }

  /* ──────────── Render ──────────── */
  return (
    <main className="min-h-screen w-full bg-[#040916] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-cyan-500/20 ring-1 ring-cyan-300/30" />
            <div>
              <h1 className="text-[13px] font-semibold tracking-wide text-cyan-200">
                NeoScience · Chatbot
              </h1>
              <p className="text-[11px] text-slate-400">from data → defense</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Modelo</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1"
            >
              <option value="neoscience-sim">neoscience-sim</option>
              <option value="astro-lite">astro-lite</option>
            </select>

            <label className="ml-2 text-slate-400">Idioma</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "es" | "en")}
              className="rounded-md border border-white/10 bg-slate-900/70 px-2 py-1"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>

            <button
              onClick={handleReset}
              type="button"
              className="ml-2 rounded-md border border-white/10 bg-slate-900/70 px-3 py-1 text-slate-200 hover:bg-slate-800"
              aria-label="Reset chat"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Chat card */}
      <section className="mx-auto max-w-2xl px-3 py-6">
        <div className="rounded-2xl border-2 border-cyan-400/70 shadow-lg shadow-cyan-500/30">
          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-[55vh] w-full overflow-y-auto rounded-t-2xl bg-gradient-to-b from-slate-950/60 to-slate-950/10 p-3 sm:p-4"
          >
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li key={m.id}>
                  <div
                    className={[
                      "max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm sm:px-4 sm:py-3",
                      m.role === "user"
                        ? "ml-auto bg-cyan-500/10 ring-1 ring-cyan-300/30"
                        : m.role === "assistant"
                        ? "mr-auto bg-slate-800/60 ring-1 ring-white/15"
                        : "mx-auto bg-amber-500/10 ring-1 ring-amber-400/30 text-amber-200",
                    ].join(" ")}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
                      <span>
                        {m.role === "user"
                          ? "Tú"
                          : m.role === "assistant"
                          ? "NeoScience Bot"
                          : "Sistema"}
                      </span>
                      <span>•</span>
                      {/* ✅ Forzamos locale y suprimimos warning de hidratación */}
                      <span
                        className="tabular-nums"
                        suppressHydrationWarning
                      >
                        {m.ts ? timeLabel(m.ts, dateLocale) : "--:--"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-100">
                      {m.content}
                    </p>
                  </div>
                </li>
              ))}

              {isSending && (
                <li className="mr-auto max-w-[92%] rounded-2xl bg-slate-800/50 px-4 py-3 text-sm ring-1 ring-white/15">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-400">
                    NeoScience Bot · escribiendo…
                  </div>
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="rounded-b-2xl border-t border-white/10 bg-slate-950/60 p-3 sm:p-4"
          >
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1">
                <label htmlFor="prompt" className="sr-only">
                  Escribe tu mensaje
                </label>
                <textarea
                  id="prompt"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje para el chatbot de NeoScience…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/70 p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <div className="mt-2 hidden flex-wrap gap-2 text-xs sm:flex">
                  {quickPrompts.map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => setInput(q)}
                      className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-slate-300 hover:bg-slate-800"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="rounded-xl bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

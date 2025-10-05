"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Iconos (si usas react-icons)
import { RiTwitterXFill, RiFacebookFill, RiLinkedinFill, RiWhatsappFill } from "react-icons/ri";
// Icono de enlace (lucide-react)
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";



/* ========= Tipos ========= */
type Item = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image?: string;
  summary?: string;
};

/* ========= Feeds oficiales ========= */
const FEEDS = [
  "https://www.nasa.gov/news-release/feed/",
  "https://www.nasa.gov/feed/",
  "https://www.jpl.nasa.gov/rss/news",
];

const MAX_ITEMS = 10;

/* Tamaño fijo del carrusel */
const CARD_W = 880; // px
const CARD_H = 420; // px

/* Placeholders */
const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' fill='black' font-size='16' text-anchor='middle' dominant-baseline='middle'>NASA</text></svg>";

const LOADING_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 100 100'><circle cx='50' cy='50' r='35' stroke='%23999' stroke-width='10' fill='none' stroke-linecap='round' stroke-dasharray='164.93361431346415 56.97787143782138'><animateTransform attributeName='transform' type='rotate' repeatCount='indefinite' dur='0.9s' values='0 50 50;360 50 50' keyTimes='0;1'/></circle></svg>";

/* ========= Utils ========= */
const toHttps = (u?: string) => (u ? u.replace(/^http:\/\//i, "https://") : u);
const safeDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(+dt)
    ? ""
    : dt.toLocaleDateString("es-GT", { year: "numeric", month: "2-digit", day: "2-digit" });
};
function firstImgFromHTML(html?: string): string | undefined {
  if (!html) return undefined;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.querySelector("img")?.getAttribute("src") || undefined;
}
function htmlToText(html?: string) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}
function tidySummary(raw?: string, max = 260) {
  if (!raw) return "";
  const s = raw.replace(/&[#a-z0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1).trim() + "…" : s;
}

/* ========= Share helpers ========= */
const addUtm = (url: string) => {
  try {
    const u = new URL(toHttps(url)!);
    u.searchParams.set("utm_source", "neoscience");
    u.searchParams.set("utm_medium", "share");
    u.searchParams.set("utm_campaign", "news");
    return u.toString();
  } catch {
    return url;
  }
};

const shareLinksFor = (title: string, link: string) => {
  const url = addUtm(link);
  const text = `${title}`;
  const enc = encodeURIComponent;
  return {
    x: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${enc(text + " " + url)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
  };
};

const tryNativeShare = async (title: string, link: string) => {
  const url = addUtm(link);
  if ((navigator as any).share) {
    try {
      await (navigator as any).share({ title, text: title, url });
      return true;
    } catch {
      /* cancelado */
    }
  }
  return false;
};

const openCentered = (href: string) => {
  const w = 680,
    h = 540;
  const y = window.top?.outerHeight ? Math.max(0, (window.top.outerHeight - h) / 2) : 0;
  const x = window.top?.outerWidth ? Math.max(0, (window.top.outerWidth - w) / 2) : 0;
  window.open(href, "_blank", `width=${w},height=${h},left=${x},top=${y},noopener`);
};

/* ========= Fetch rápido vía rss2json ========= */
async function fetchJSONWithFallback<T = any>(url: string): Promise<T> {
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as T;
  } catch {
    const prox = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const r2 = await fetch(prox);
    const j = await r2.json();
    return JSON.parse(j.contents) as T;
  }
}

async function fetchFeed(url: string): Promise<Item[]> {
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  const data = await fetchJSONWithFallback<any>(api);
  const items: Item[] = (data?.items || []).map((it: any) => ({
    title: it.title,
    link: it.link || it.guid || "#",
    pubDate: it.pubDate || it.pubdate || it.date || it.updated || "",
    source: url,
    image: it.thumbnail || firstImgFromHTML(it.content || it.description || ""),
    summary: tidySummary(htmlToText(it.content || it.description || it.summary || ""), 260),
  }));
  return items;
}

/* ========= Carrusel (sin autoplay) ========= */
function Carousel({ items }: { items: Item[] }) {
  const list = useMemo(() => items.slice(0, MAX_ITEMS), [items]);
  const [idx, setIdx] = useState(0);

  const goPrev = useCallback(() => setIdx((i) => (i - 1 + list.length) % list.length), [list.length]);
  const goNext = useCallback(() => setIdx((i) => (i + 1) % list.length), [list.length]);

  // Navegación con teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Swipe en móviles
  const startX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? goPrev() : goNext();
  };

  // Precarga de la próxima imagen
  useEffect(() => {
    if (!list.length) return;
    const next = list[(idx + 1) % list.length]?.image;
    if (!next) return;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.src = toHttps(next)!;
  }, [idx, list]);

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Noticias de la NASA"
      className="relative mx-auto"
      style={{ width: CARD_W, height: CARD_H }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Marco blanco */}
      <div className="overflow-hidden rounded-xl border border-black/10 bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 text-black shadow-sm w-full h-full">
        {/* Track horizontal */}
        <div
          className="flex w-full h-full will-change-transform"
          style={{
            transform: `translateX(-${idx * CARD_W}px)`,
            transition: "transform 250ms ease",
            width: CARD_W * list.length,
          }}
        >
          {list.map((it) => {
            const img = toHttps(it.image) || PLACEHOLDER;
            const host = new URL(it.source).host.replace(/^www\./, "");
            const share = shareLinksFor(it.title, it.link);
            return (
              <article key={it.link} className="p-4" style={{ width: CARD_W, height: CARD_H }}>
                <div className="w-full h-full grid grid-rows-[auto_1fr_auto] gap-3">
                  {/* Imagen fija */}
                  <div className="w-full" style={{ height: Math.min(220, CARD_H - 180) }}>
                    <img
                      src={img}
                      alt={it.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-md border border-black/5"
                    />
                  </div>

                  {/* Texto */}
                  <div className="overflow-hidden">
                    <div className="text-xs opacity-70">
                      {host} • {safeDate(it.pubDate)}
                    </div>
                    <h3 className="text-lg font-semibold leading-snug mt-1 line-clamp-2">{it.title}</h3>
                    {it.summary && <p className="text-sm mt-2 opacity-90 line-clamp-3">{it.summary}</p>}
                  </div>

                  {/* Acciones: leer + compartir */}
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block font-semibold hover:underline"
                    >
                      Leer más →
                    </a>

                    {/* Iconos de redes */}
                    <div className="flex items-center gap-2">
                      <a
                        href={share.x}
                        onClick={(e) => {
                          e.preventDefault();
                          openCentered(share.x);
                        }}
                        className="w-9 h-9 grid place-items-center rounded-full text-white hover:scale-105 transition"
                        style={{ background: "#000000" }}
                        title="Compartir en X"
                        aria-label="Compartir en X"
                      >
                        <RiTwitterXFill size={18} />
                      </a>

                      <a
                        href={share.facebook}
                        onClick={(e) => {
                          e.preventDefault();
                          openCentered(share.facebook);
                        }}
                        className="w-9 h-9 grid place-items-center rounded-full text-white hover:scale-105 transition"
                        style={{ background: "#1877F2" }}
                        title="Compartir en Facebook"
                        aria-label="Compartir en Facebook"
                      >
                        <RiFacebookFill size={18} />
                      </a>

                      <a
                        href={share.linkedin}
                        onClick={(e) => {
                          e.preventDefault();
                          openCentered(share.linkedin);
                        }}
                        className="w-9 h-9 grid place-items-center rounded-full text-white hover:scale-105 transition"
                        style={{ background: "#0A66C2" }}
                        title="Compartir en LinkedIn"
                        aria-label="Compartir en LinkedIn"
                      >
                        <RiLinkedinFill size={18} />
                      </a>

                      <a
                        href={share.whatsapp}
                        onClick={(e) => {
                          e.preventDefault();
                          openCentered(share.whatsapp);
                        }}
                        className="w-9 h-9 grid place-items-center rounded-full text-white hover:scale-105 transition"
                        style={{ background: "#25D366" }}
                        title="Compartir en WhatsApp"
                        aria-label="Compartir en WhatsApp"
                      >
                        <RiWhatsappFill size={18} />
                      </a>

                      {/* Copiar enlace */}
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(addUtm(it.link));
                            alert("Enlace copiado ✅");
                          } catch {
                            alert("No se pudo copiar 😬");
                          }
                        }}
                        className="w-9 h-9 grid place-items-center rounded-full text-white hover:scale-105 transition bg-gray-700"
                        title="Copiar enlace"
                        aria-label="Copiar enlace"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Flechas laterales GRANDES */}
      {list.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={goPrev}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 72,
              height: 72,
              borderRadius: "9999px",
              background: "rgba(0,0,0,.75)",
              color: "#fff",
              zIndex: 50,
              display: "grid",
              placeItems: "center",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,.35)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            aria-label="Siguiente"
            onClick={goNext}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 72,
              height: 72,
              borderRadius: "9999px",
              background: "rgba(0,0,0,.75)",
              color: "#fff",
              zIndex: 50,
              display: "grid",
              placeItems: "center",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(0,0,0,.35)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

/* ========= Página ========= */
export default function NewsOfWeek() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const results = await Promise.allSettled(FEEDS.map(fetchFeed));
        const all = results
          .filter((r): r is PromiseFulfilledResult<Item[]> => r.status === "fulfilled")
          .flatMap((r) => r.value)
          .filter((it) => it.pubDate);

        // dedup + ordenar + top10
        const dedup = Object.values(
          all.reduce<Record<string, Item>>((acc, it) => {
            const k = it.link || `${it.title}-${it.source}`;
            const prev = acc[k];
            if (!prev || +new Date(it.pubDate) > +new Date(prev.pubDate)) acc[k] = it;
            return acc;
          }, {})
        ).sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));

        setItems(dedup.slice(0, MAX_ITEMS));
      } catch (e: any) {
        setErr(e?.message || "Error cargando noticias");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="w-full flex flex-col items-center gap-4 py-6  pt-20">
      <h2 className="text-3xl font-bold text-center">{t("news:newsTitle")}</h2>

      {loading && (
        <div
          className="grid place-items-center rounded-xl border border-black/10 bg-black shadow-sm"
          style={{ width: CARD_W, height: CARD_H }}
        >
          <img src={LOADING_IMG} alt="Cargando…" width={120} height={120} />
        </div>
      )}

      {err && <div className="text-red-600 text-center">{err}</div>}

      {!loading && !err && items.length > 0 && <Carousel items={items} />}

      {!loading && !err && items.length === 0 && (
        <div
          className="grid place-items-center rounded-xl border border-black/10 bg-white shadow-sm text-black"
          style={{ width: CARD_W, height: CARD_H }}
        >
          No hay noticias por ahora.
        </div>
      )}
    </section>
  );
}

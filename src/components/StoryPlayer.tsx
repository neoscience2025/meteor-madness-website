"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StoryPlayer — Playlist de videos en secuencia con overlays de texto
 *
 * ✔ TSX listo para Next.js (app router)
 * ✔ Reproduce N clips MP4 uno tras otro (sin re-encodear)
 * ✔ Overlays por escena (titulo + subtítulo opcional)
 * ✔ CTA final con botón/link
 * ✔ Controles (Play/Pause, Next, Prev), barra y dots de progreso
 * ✔ Teclas rápidas: [Espacio]=play/pause, [←]/[→]=anterior/siguiente
 *
 * Colocá tus videos en /public/videos (1.mp4, 2.mp4, ...)
 * y ajustá el arreglo `scenes` a tu gusto.
 */

// ============================ Tipos ============================
type Scene = {
  src: string; // ruta al mp4
  title?: string;
  subtitle?: string;
  // Si querés forzar un tiempo mínimo de permanencia (ms) antes de permitir "Next"
  minMs?: number;
};

// ============================ Datos de ejemplo ============================
// ⚠️ Ajustá estas rutas a tus archivos reales en /public/videos
const scenes: Scene[] = Array.from({ length: 13 }).map((_, i) => ({
  src: `/videos/${i + 1}.mp4`,
  title: i === 0
    ? " "
    : i === 6
    ? " "
    : i === 12
    ? " "
    : undefined,
  subtitle:
    i === 0
      ? " "
      : i === 6
      ? " "
      : i === 12
      ? ""
      : undefined,
  minMs: 1200,
}));


// ============================ Componente ============================
export default function StoryPlayer() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [allowNext, setAllowNext] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const minTimer = useRef<NodeJS.Timeout | null>(null);

  const scene = scenes[idx];
  const isLast = idx === scenes.length - 1;

  // Habilita/deshabilita Next por minMs de la escena
  useEffect(() => {
    setAllowNext(!scene?.minMs);
    if (minTimer.current) clearTimeout(minTimer.current);
    if (scene?.minMs) {
      minTimer.current = setTimeout(() => setAllowNext(true), scene.minMs);
    }
    return () => {
      if (minTimer.current) clearTimeout(minTimer.current);
    };
  }, [idx]);

  // Autoplay al cambiar de escena (cuando el <video> está listo)
  const handleCanPlay = useCallback(() => {
    setReady(true);
    if (playing) videoRef.current?.play().catch(() => {});
  }, [playing]);

  const handleEnded = useCallback(() => {
    if (!isLast) {
      setIdx((n) => Math.min(n + 1, scenes.length - 1));
    } else {
      setPlaying(false);
    }
  }, [isLast]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const goNext = useCallback(() => {
    if (!allowNext) return;
    setIdx((n) => Math.min(n + 1, scenes.length - 1));
  }, [allowNext]);

  const goPrev = useCallback(() => {
    setIdx((n) => Math.max(n - 1, 0));
  }, []);

  // Teclas rápidas
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        goNext();
      } else if (e.code === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, goNext, goPrev]);

  // Progreso (dots)
  const dots = useMemo(() => scenes.map((_, i) => i <= idx), [idx]);

  return (
    <div className="mx-auto max-w-4xl w-full p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
        {/* Video */}
        <video
          key={scene.src}
          ref={videoRef}
          className="h-full w-full object-cover"
          src={scene.src}
          playsInline
          onCanPlay={handleCanPlay}
          onEnded={handleEnded}
          autoPlay
          controls={false}
        />

        {/* Overlay texto por escena */}
        <AnimatePresence mode="wait">
          {(scene.title || scene.subtitle) && (
            <motion.div
              key={`overlay-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6"
            >
              <div className="text-white drop-shadow-lg">
                {scene.title && (
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  
                  </h2>
                )}
                {scene.subtitle && (
                  <p className="mt-1 text-sm md:text-base opacity-90">
                   
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="rounded-xl bg-white/10 px-3 py-2 text-white backdrop-blur hover:bg-white/20 disabled:opacity-40"
              disabled={idx === 0}
              aria-label="Anterior"
            >
              ◀
            </button>
            <button
              onClick={togglePlay}
              className="rounded-xl bg-white px-3 py-2 font-semibold hover:opacity-90 "
              style={{ backgroundColor: "#ff5722" }}
              aria-label="Play/Pause"
            >
              {playing ? "Pausa" : "Play"}
            </button>
            <button
              onClick={goNext}
              className={`rounded-xl px-3 py-2 text-white backdrop-blur ${
                allowNext ? "bg-white/10 hover:bg-white/20" : "bg-white/10 opacity-40"
              }`}
              aria-label="Siguiente"
              disabled={!allowNext}
            >
              ▶
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-1">
            {dots.map((active, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cierre con CTA — aparece cuando termina el último clip */}
      {isLast && !playing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border bg-white p-6 shadow"
        >
          
          <div className="mt-4 flex flex-wrap items-center gap-3">
           
            <button
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
              onClick={() => {
                setIdx(0);
                setPlaying(true);
                setTimeout(() => videoRef.current?.play().catch(() => {}), 50);
              }}
            >
              Ver de nuevo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

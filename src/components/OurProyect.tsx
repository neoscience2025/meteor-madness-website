// src/components/AboutProject.tsx
"use client";

import {
  Trophy,
  Rocket,
  Cpu,
  Database,
} from "lucide-react";
import { Orbitron } from "next/font/google";

// Fuente sci-fi para TODO el bloque
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export default function AboutProject() {
  return (
    <section
      id="aboutus"
      className="relative py-24 md:py-32 text-white"
      style={{
        width: "100%",
        padding: "64px 16px 72px",
        background:
          "radial-gradient(circle at 50% -40%, #03071aff 0%, #000 55%, #000 100%)",
        fontFamily: orbitron.style.fontFamily, // 👈 misma fuente para todo
      }}
    >
      {/* Título centrado */}
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
        ABOUT THE PROJECT
      </h2>

      {/* Contenedor centrado */}
      <div className="mx-auto w-[min(68rem,92vw)]">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-6">
          <div>
           
            <p
  className="mt-3 max-w-2xl text-white/80 md:text-justify text-left leading-relaxed break-normal"
  style={{
    textJustify: "inter-word", // reparte espacios entre palabras
    hyphens: "none",           // sin guiones
  }}
>
  Our team&#39;s objective is to transform open spatial data into actionable decisions
  through interactive visualizations, adjustable simulations, and micro-lessons
  that translate theory into practice.
</p>
          </div>

            <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-white/80">
                <Trophy className="h-4 w-4 text-yellow-300" />
               <span className="text-yellow-300">2025 NASA Space Apps Challenge </span>
            </div>
          </div>
        </div>

        {/* Reto + Fuentes + Stack */}
        <div className="grid gap-6 md:grid-cols-3">
         <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
 <div className="mb-3 flex items-center gap-2">
  <Rocket className="h-5 w-5" />
  <h4 className="font-semibold">
    The Challenge
  </h4>
</div>



             <div className="mb-3 flex items-center gap-2">
              
              <h4 className="font-semibold text-yellow-200">Meteor Madness</h4>
            </div>
            <p
  className="text-white/80 text-sm leading-relaxed md:text-justify text-left break-normal"
  style={{ textJustify: "inter-word", hyphens: "none" }}
>
  To build an application that converts open data on meteors and NEOs (Near-Earth Objects) into actionable decisions.
  This involves visualizing trajectories and events, estimating energy/impact, and simulating &#39;what-if&#39; scenarios.
  The application must communicate risk clearly and educationally, featuring near real-time interaction.
</p>
          </div>

        <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-5 w-5" />
              <h4 className="font-semibold">Data Sources</h4>
            </div>
           <ul className="space-y-2 text-sm text-white/80">
  <li>• <a href="https://www.nasa.gov/news-release/feed/" target="_blank" className="hover:text-cyan-300">NASA News Feed (News Release)</a></li>
  <li>• <a href="https://www.nasa.gov/feed/" target="_blank" className="hover:text-cyan-300">NASA News Feed</a></li>
  <li>• <a href="https://www.jpl.nasa.gov/rss/news" target="_blank" className="hover:text-cyan-300">JPL News Feed</a></li>
  <li>• <a href="https://api.nasa.gov/" target="_blank" className="hover:text-cyan-300">NASA Open APIs Hub</a></li>
</ul>

          </div>

          <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              <h4 className="font-semibold">Stack</h4>
            </div>
            <ul className="space-y-2 text-sm text-white/80">
   <li>• React</li>
<li>• Next.js</li>
<li>• TailwindCSS</li>
<li>• Framer Motion</li>
<li>• Machine Learning</li>
<li>• AI Chatbot</li>

  </ul>
          </div>

          <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
    <span className="text-cyan-300">🎨</span>
    <h4 className="font-semibold">UI / UX</h4>
  </div>
  <ul className="space-y-2 text-sm text-white/80">
    <li>• Figma (prototyping & wireframes)</li>
    <li>• User-centered design</li>
    <li>• Responsive interfaces</li>
    <li>• Iterative testing</li>
  </ul>
</div>
          <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
             <span className="text-cyan-300">📋</span>
    <h4 className="font-semibold">Methodology</h4>
            </div>
              <ul className="space-y-2 text-sm text-white/80">
    <li>• Agile / Scrum</li>
    <li>• Sprint Planning</li>
    <li>• Trello (task management)</li>
    <li>• Team collaboration & reviews</li>
  </ul>
          </div>
           
 <div className="rounded-2xl border-2 border-cyan-400/40 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
    <span className="text-cyan-300">🌍</span>
    <h4 className="font-semibold">Impact / Purpose</h4>
  </div>
  <ul className="space-y-2 text-sm text-white/80">
    <li>• Raise awareness about Near-Earth Objects (NEOs) and planetary defense</li>
    <li>• Inspire the next generation through science and technology</li>
    <li>• Transform NASA data into clear, actionable insights for everyone</li>
  </ul>
</div>


        </div>

        

        {/* CTA final */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/15 to-purple-600/15 p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h5 className="text-lg font-semibold">Comments or Ideas?</h5>
              <p className="text-white/80 text-sm">
               Write to us and tell us what you&apos;d like to explore. Science is built as a team effort.
              </p>
            </div>
            <a
              href="mailto:marian.paredes@gmail.com"
              className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur hover:bg-white/25 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Fuerza herencia por si algo trae otra fuente */}
      <style jsx>{`
        #aboutus * { font-family: inherit !important; }
      `}</style>
    </section>
  );
}

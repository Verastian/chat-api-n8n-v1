"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const STACK = [
  { label: "Next.js 15", desc: "App Router · SSR", color: "from-gray-700 to-gray-900", icon: "▲" },
  { label: "N8N", desc: "Orquestación de flujos", color: "from-orange-500 to-red-500", icon: "⚡" },
  { label: "Gemini", desc: "IA · gemini-2.5-flash", color: "from-blue-500 to-cyan-400", icon: "✦" },
  { label: "TypeScript", desc: "Tipado estático", color: "from-blue-600 to-blue-400", icon: "TS" },
  { label: "Tailwind v4", desc: "CSS utilitario", color: "from-teal-500 to-cyan-500", icon: "🌊" },
  { label: "GSAP", desc: "Animaciones web", color: "from-green-600 to-emerald-400", icon: "🎬" },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-badge", { opacity: 0, y: -20, duration: 0.5 })
      .from(".hero-title", { opacity: 0, y: 30, duration: 0.7 }, "-=0.2")
      .from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
      .from(".hero-cta", { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
      .from(".stack-card", { opacity: 0, y: 30, stagger: 0.1, duration: 0.5 }, "-=0.2");
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Fondo con gradiente radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En línea · Chat API N8N v1
        </div>

        <h1 className="hero-title text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Asistente virtual{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            con IA
          </span>{" "}
          y N8N
        </h1>

        <p className="hero-subtitle text-lg text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
          Chatbox empresarial conectado a{" "}
          <span className="text-gray-300 font-medium">N8N</span> vía webhook, con{" "}
          <span className="text-gray-300 font-medium">Gemini 2.5 Flash</span> como motor de IA
          y memoria conversacional por sesión.
        </p>

        <div className="hero-cta flex items-center justify-center gap-3 mb-20">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
            className="
              group flex items-center gap-2.5 px-6 py-3 rounded-full
              bg-gradient-to-r from-indigo-500 to-violet-600
              text-white text-sm font-semibold
              shadow-lg shadow-indigo-500/30
              hover:shadow-indigo-500/50 hover:scale-105
              transition-all duration-300
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Hablar con el asistente
          </button>
        </div>

        {/* Stack de tecnologías — siempre visible */}
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-medium">Stack</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STACK.map((tech) => (
            <div
              key={tech.label}
              className="stack-card group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                {tech.icon}
              </div>
              <span className="text-xs font-semibold text-white leading-tight text-center">{tech.label}</span>
              <span className="text-[10px] text-gray-500 text-center leading-tight">{tech.desc}</span>
            </div>
          ))}
        </div>

        {/* Flujo de arquitectura */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600 flex-wrap">
          <span className="text-gray-500">Next.js</span>
          <span className="text-gray-700">→</span>
          <span className="text-gray-500">/api/chat</span>
          <span className="text-gray-700">→</span>
          <span className="text-gray-500">N8N Webhook</span>
          <span className="text-gray-700">→</span>
          <span className="text-gray-500">Agente IA</span>
          <span className="text-gray-700">→</span>
          <span className="text-gray-500">Gemini 2.5 Flash</span>
        </div>
      </div>
    </section>
  );
}

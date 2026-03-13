"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import ChatMessage, { TypingIndicator } from "./ChatMessage";
import EmojiPicker from "./EmojiPicker";
import type { Message, Rating } from "@/types/chat";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hola 👋 Soy tu asistente IA conectado a N8N con un flujo RAG, usando Mistral vía Ollama e integración con Telegram. ¿En qué te ayudo hoy?",
  timestamp: new Date(),
};

export default function ChatFull() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const sidebarRef   = useRef<HTMLElement>(null);
  const mainRef      = useRef<HTMLDivElement>(null);

  const [messages,  setMessages]  = useState<Message[]>([WELCOME]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sessionId] = useState(() => `ses-${Date.now().toString(36).slice(-6)}`);

  /* ── GSAP entrada ── */
  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(sidebarRef.current, { x: -40, opacity: 0, duration: 0.5 })
      .from(mainRef.current,    { y: 20,  opacity: 0, duration: 0.5 }, "-=0.3");
  }, { scope: containerRef });

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  /* ── Focus inicial ── */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* ── Cerrar emoji picker ── */
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".emoji-picker-wrapper") && !t.closest(".emoji-toggle-btn"))
        setShowEmoji(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  /* ── Enviar mensaje ── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowEmoji(false);

    // TODO: conectar con N8N webhook
    // const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ message: text, sessionId }),
    // });
    // const { output } = await res.json();

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Procesando con el flujo RAG en N8N. Sesión ${sessionId}. Conecta el webhook de N8N para activar respuestas reales con Mistral.`,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleRate = useCallback((id: string, rating: Rating) => {
    setMessages((p) => p.map((m) => m.id === id ? { ...m, rating } : m));
  }, []);

  const handleEmojiSelect = (emoji: { native: string }) => {
    setInput((p) => p + emoji.native);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="flex h-screen bg-[#0f0f1a] overflow-hidden">

      {/* ─── Sidebar ─── */}
      <aside
        ref={sidebarRef}
        className="w-60 shrink-0 bg-[#13131f] border-r border-white/8 flex flex-col"
      >
        {/* Brand */}
        <div className="px-4 py-4 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              AC
            </div>
            <div>
              <p className="text-sm font-semibold text-white">chatAssistant</p>
              <p className="text-[10px] text-gray-600 mt-0.5">N8N · Mistral · v1</p>
            </div>
          </Link>
        </div>

        {/* Nueva conversación */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setMessages([WELCOME])}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/25 text-indigo-300 text-xs hover:bg-indigo-500/10 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Nueva conversación
          </button>
        </div>

        {/* Historial */}
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <p className="text-[9px] text-gray-700 uppercase tracking-widest px-2 mb-2">Recientes</p>
          {messages.some((m) => m.role === "user") && (
            <div className="px-3 py-2 rounded-lg bg-indigo-500/8 border border-indigo-500/15 cursor-default">
              <p className="text-xs text-gray-300 truncate">
                {messages.find((m) => m.role === "user")?.content}
              </p>
              <p className="text-[9px] text-gray-600 mt-0.5">Sesión {sessionId}</p>
            </div>
          )}
        </div>

        {/* Estado del stack */}
        <div className="px-4 py-3 border-t border-white/8 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-gray-500">N8N RAG activo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[11px] text-gray-500">Ollama · Mistral</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#229ED9]" />
            <span className="text-[11px] text-gray-500">Telegram bot</span>
          </div>
        </div>

        {/* Volver */}
        <div className="px-3 pb-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 text-xs transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Volver al inicio
          </Link>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div ref={mainRef} className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-sm font-bold text-white">
                AC
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">chatAssistant</p>
              <p className="text-xs text-indigo-200">En línea · RAG conectado</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.516c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 14.5l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.626.085z" />
              </svg>
              Telegram
            </span>
            <button
              onClick={() => setMessages([WELCOME])}
              title="Limpiar conversación"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll chat-bg-pattern px-6 py-5 flex flex-col gap-4">
          <div className="flex justify-center">
            <span className="text-[10px] text-gray-700 bg-white/4 border border-white/6 rounded-full px-3 py-1">
              Sesión {sessionId}
            </span>
          </div>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onRate={handleRate} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-[#13131f] border-t border-white/8 shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center gap-2 bg-[#1e1e2e] rounded-xl border border-white/10 px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta al asistente..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50"
              />

              {/* Emoji */}
              <div className="relative">
                <button
                  onClick={() => setShowEmoji((p) => !p)}
                  className="emoji-toggle-btn w-7 h-7 flex items-center justify-center text-gray-600 hover:text-yellow-400 transition-colors text-base"
                  title="Emoji"
                >
                  😊
                </button>
                {showEmoji && (
                  <div className="emoji-picker-wrapper">
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="
                  w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0
                  hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200 hover:scale-105 active:scale-95
                "
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-700 mt-2">
              Enter · enviar &nbsp;|&nbsp; Impulsado por Mistral · Ollama · N8N RAG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

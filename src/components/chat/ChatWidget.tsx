"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ChatMessage, { TypingIndicator } from "./ChatMessage";
import EmojiPicker from "./EmojiPicker";
import type { Message, Rating } from "@/types/chat";

const WELCOME_CONTENT = "¡Hola! 👋 Soy el asistente virtual. Estoy aquí para responder tus preguntas sobre nuestros servicios. ¿En qué puedo ayudarte?";

export default function ChatWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const fabRef       = useRef<HTMLButtonElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const [isOpen,    setIsOpen]    = useState(false);
  // Timestamp creado en cliente para evitar error de hidratación
  const [messages,  setMessages]  = useState<Message[]>(() => [
    { id: "welcome", role: "assistant", content: WELCOME_CONTENT, timestamp: new Date(0) },
  ]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // useGSAP solo maneja open/close — el panel empieza oculto via CSS (style prop)
  useGSAP(() => {}, { scope: containerRef });

  /* ── Abrir / cerrar panel ── */
  const { contextSafe } = useGSAP({ scope: containerRef });

  const openPanel = contextSafe(() => {
    gsap.to(panelRef.current, {
      opacity: 1, y: 0, scale: 1, duration: 0.32,
      ease: "back.out(1.5)", pointerEvents: "auto",
    });
    setTimeout(() => inputRef.current?.focus(), 330);
  });

  const closePanel = contextSafe(() => {
    gsap.to(panelRef.current, {
      opacity: 0, y: 20, scale: 0.95, duration: 0.2,
      ease: "power2.in", pointerEvents: "none",
    });
  });

  const toggleChat = contextSafe(() => {
    // Bounce del FAB
    gsap.timeline()
      .to(fabRef.current, { scale: 0.82, duration: 0.1, ease: "power2.in" })
      .to(fabRef.current, { scale: 1,    duration: 0.25, ease: "back.out(2.5)" });

    if (isOpen) {
      closePanel();
      setIsOpen(false);
    } else {
      setIsOpen(true);
      openPanel();
    }
  });

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  /* ── Cerrar emoji al click afuera ── */
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

  /* ── Escuchar evento externo para abrir el chat ── */
  useEffect(() => {
    const handler = () => {
      if (!isOpen) toggleChat();
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Enviar mensaje ── */
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowEmoji(false);

    let responseContent = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: "widget" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      responseContent = data.output ?? "No se recibió respuesta del asistente.";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      responseContent = `⚠️ ${msg}`;
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
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

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-50">

      {/* ══════════════════════════════════
          PANEL DEL CHAT — 350 × 500 px
          Absolute sobre el FAB, no ocupa espacio en el flujo
          ══════════════════════════════════ */}
      <div
        ref={panelRef}
        className="
          absolute bottom-[60px] right-0
          w-[350px] bg-[#1a1a2e] rounded-2xl shadow-2xl
          border border-white/10 flex flex-col overflow-hidden
        "
        style={{
          height: 500,
          // Oculto desde SSR — GSAP solo anima hacia visible, nunca oculta
          opacity: 0,
          transform: "translateY(20px) scale(0.95)",
          pointerEvents: "none",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 shrink-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white">
              AC
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none">chatAssistant</p>
            <p className="text-xs text-indigo-200 mt-0.5">En línea · Listo para ayudarte</p>
          </div>

          {/* Cerrar */}
          <button
            onClick={toggleChat}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors shrink-0"
            aria-label="Cerrar chat"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Mensajes ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scroll chat-bg-pattern px-3 py-3 flex flex-col gap-2.5"
        >
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onRate={handleRate} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>

        {/* ── Input ── */}
        <div className="px-3 py-3 bg-[#13131f] border-t border-white/8 shrink-0">
          <div className="flex items-center gap-2 bg-[#1e1e2e] rounded-xl border border-white/10 px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50 min-w-0"
            />

            {/* Emoji toggle */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowEmoji((p) => !p)}
                className="emoji-toggle-btn w-7 h-7 flex items-center justify-center text-gray-500 hover:text-yellow-400 transition-colors text-[15px]"
                title="Emoji"
                tabIndex={-1}
              >
                😊
              </button>
              {showEmoji && (
                <div className="emoji-picker-wrapper">
                  <EmojiPicker onEmojiSelect={(e) => { setInput((p) => p + e.native); inputRef.current?.focus(); }} />
                </div>
              )}
            </div>

            {/* Enviar */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="
                shrink-0 w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center
                hover:bg-indigo-400 disabled:opacity-35 disabled:cursor-not-allowed
                transition-all duration-200 hover:scale-105 active:scale-95
              "
              aria-label="Enviar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-700 mt-1.5 select-none">
            Impulsado por Mistral · N8N
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════
          FAB — 48 × 48 px
          ══════════════════════════════════ */}
      <button
        ref={fabRef}
        onClick={toggleChat}
        className="
          relative w-12 h-12 rounded-full
          bg-gradient-to-br from-indigo-500 to-violet-600
          shadow-lg shadow-indigo-500/40
          flex items-center justify-center text-white
          hover:shadow-indigo-500/60 hover:scale-110
          transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
          focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]
        "
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {/* Ícono chat */}
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-200"
          style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? "scale(0.4) rotate(90deg)" : "scale(1) rotate(0deg)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        {/* Ícono cerrar */}
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-200"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "scale(1) rotate(0deg)" : "scale(0.4) rotate(-90deg)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </span>

        {/* Ping online */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        )}
      </button>
    </div>
  );
}

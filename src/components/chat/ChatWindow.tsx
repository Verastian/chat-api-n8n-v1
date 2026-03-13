"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ChatMessage, { TypingIndicator } from "./ChatMessage";
import EmojiPicker from "./EmojiPicker";
import type { Message, Rating } from "@/types/chat";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hola 👋 Soy tu asistente IA. Estoy conectado a N8N con un flujo RAG usando Mistral vía Ollama. También puedes escribirme por Telegram. ¿En qué te ayudo?",
  timestamp: new Date(),
};

export default function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const windowRef  = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input,    setInput]    = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  /* ── GSAP slide-in / slide-out ── */
  useGSAP(() => {
    if (!windowRef.current) return;
    if (isOpen) {
      gsap.fromTo(
        windowRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0,  opacity: 1, scale: 1, duration: 0.32, ease: "back.out(1.4)" }
      );
      setTimeout(() => inputRef.current?.focus(), 330);
    }
  }, { dependencies: [isOpen] });

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  /* ── Cerrar emoji picker al hacer click fuera ── */
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".emoji-picker-wrapper") && !target.closest(".emoji-toggle-btn"))
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

    // TODO: reemplazar con fetch al webhook N8N
    // const res = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ message: text, sessionId: "widget" }),
    // });
    // const data = await res.json();

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `He recibido tu mensaje. El flujo RAG en N8N procesará esto con Mistral. (Respuesta simulada — conecta el webhook para activar el flujo real.)`,
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

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="
        absolute bottom-[72px] right-0
        w-[350px] max-w-[calc(100vw-1.5rem)]
        bg-[#1a1a2e] rounded-2xl shadow-2xl
        border border-white/10
        flex flex-col overflow-hidden
      "
      style={{ height: 500 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 shrink-0">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-sm font-bold text-white border-2 border-white/30 shadow">
            AC
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-none">chatAssistant</p>
          <p className="text-xs text-indigo-200 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            En línea · Mistral RAG
          </p>
        </div>

        {/* Telegram + cerrar */}
        <div className="flex items-center gap-1.5">
          <span title="Telegram bot activo" className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.516c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 14.5l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.626.085z" />
            </svg>
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll chat-bg-pattern px-4 py-4 flex flex-col gap-3"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onRate={handleRate} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* ── Input ── */}
      <div className="px-3 py-3 bg-[#13131f] border-t border-white/8 shrink-0">
        <div className="relative flex items-center gap-2 bg-[#1e1e2e] rounded-xl border border-white/10 px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none disabled:opacity-50"
          />

          {/* Emoji toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmoji((p) => !p)}
              className="emoji-toggle-btn w-7 h-7 flex items-center justify-center text-gray-500 hover:text-yellow-400 transition-colors text-base"
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
              w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center
              hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 hover:scale-105 active:scale-95 shrink-0
            "
            aria-label="Enviar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-2 select-none">
          Mistral · Ollama · N8N RAG
        </p>
      </div>
    </div>
  );
}

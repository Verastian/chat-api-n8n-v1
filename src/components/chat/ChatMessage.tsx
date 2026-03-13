"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { Message, Rating } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onRate?: (id: string, rating: Rating) => void;
}

export default function ChatMessage({ message, onRate }: ChatMessageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isUser = message.role === "user";

  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 10,
      x: isUser ? 10 : -10,
      duration: 0.28,
      ease: "power2.out",
    });
  }, []);

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={ref}
      className={`flex gap-2 group/msg ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white mt-0.5 shadow-md">
          AC
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`
            px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? "bg-indigo-500 text-white rounded-tr-sm"
              : "bg-[#252538] text-gray-100 rounded-tl-sm border border-white/6"
            }
          `}
        >
          {message.content}
        </div>

        {/* Time + rating */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-600" suppressHydrationWarning>{time}</span>

          {/* Rating — solo en mensajes del assistant */}
          {!isUser && onRate && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRate(message.id, "helpful")}
                title="Útil"
                className={`
                  rating-btn w-5 h-5 rounded flex items-center justify-center
                  transition-colors text-[13px]
                  ${message.rating === "helpful"
                    ? "text-emerald-400 opacity-100! translate-y-0!"
                    : "text-gray-600 hover:text-emerald-400"
                  }
                `}
              >
                👍
              </button>
              <button
                onClick={() => onRate(message.id, "not-helpful")}
                title="No útil"
                className={`
                  rating-btn w-5 h-5 rounded flex items-center justify-center
                  transition-colors text-[13px]
                  ${message.rating === "not-helpful"
                    ? "text-red-400 opacity-100! translate-y-0!"
                    : "text-gray-600 hover:text-red-400"
                  }
                `}
              >
                👎
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar usuario */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-bold text-indigo-300 mt-0.5">
          Tú
        </div>
      )}
    </div>
  );
}

/* ── Typing indicator ── */
export function TypingIndicator() {
  return (
    <div className="flex gap-2 flex-row">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md">
        AC
      </div>
      <div className="bg-[#252538] border border-white/6 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span className="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
      </div>
    </div>
  );
}

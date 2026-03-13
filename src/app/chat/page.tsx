import type { Metadata } from "next";
import ChatFull from "@/components/chat/ChatFull";

export const metadata: Metadata = {
  title: "Chat · Asistente N8N Mistral",
  description: "Interfaz de chat con IA local (Mistral/Ollama) y flujo RAG en N8N",
};

export default function ChatPage() {
  return <ChatFull />;
}

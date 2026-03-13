import Hero from "@/components/home/Hero";
import ChatWidget from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0f0f1a]">
      <Hero />
      <ChatWidget />
    </main>
  );
}

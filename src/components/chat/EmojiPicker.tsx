"use client";

import { memo } from "react";
import dynamic from "next/dynamic";

// Carga dinámica para evitar SSR issues con emoji-mart
const Picker = dynamic(
  () => import("@emoji-mart/react").then((m) => m.default),
  { ssr: false, loading: () => null }
);

interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
}

function EmojiPickerComponent({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <div className="absolute bottom-full right-0 mb-2 z-50">
      <Picker
        onEmojiSelect={onEmojiSelect}
        locale="es"
        theme="dark"
        set="native"
        previewPosition="none"
        skinTonePosition="none"
        categories={["people", "nature", "foods", "activity", "places", "objects", "symbols"]}
        perLine={8}
        emojiSize={20}
        emojiButtonSize={28}
      />
    </div>
  );
}

export default memo(EmojiPickerComponent);

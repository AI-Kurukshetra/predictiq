"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AiChat } from "@/components/ai/ai-chat";

export function AiChatTrigger({ equipmentId }: { equipmentId?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#3B82F6] shadow-xl transition hover:scale-110"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      <AiChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        equipmentId={equipmentId}
      />
    </>
  );
}

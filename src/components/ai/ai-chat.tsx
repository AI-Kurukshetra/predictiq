"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const GENERAL_SUGGESTIONS = [
  "Which equipment needs attention?",
  "Show me critical alerts",
  "Generate a maintenance plan",
];

const EQUIPMENT_SUGGESTIONS = [
  "What's wrong with this machine?",
  "Explain the latest anomaly",
  "What maintenance is recommended?",
];

export function AiChat({
  isOpen,
  onClose,
  equipmentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm PredictIQ's AI assistant. Ask me about equipment health, sensor anomalies, or maintenance recommendations.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, equipmentId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response ?? data.error ?? "Unable to respond.", timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI is temporarily unavailable. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = equipmentId ? EQUIPMENT_SUGGESTIONS : GENERAL_SUGGESTIONS;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-[#E8ECF1] bg-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8ECF1] px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E07A5F]" />
            <div>
              <h3 className="text-sm font-semibold text-[#1A2332]">PredictIQ AI</h3>
              <p className="text-[10px] text-[#8C95A6]">Powered by Gemini</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[#F5F6FA]">
            <X className="h-4 w-4 text-[#5A6578]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "rounded-br-none bg-[#F5F6FA] text-[#1A2332]"
                    : "rounded-bl-none border border-[#E8ECF1] bg-white text-[#1A2332]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-lg border border-[#E8ECF1] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C95A6]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C95A6]" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C95A6]" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-[#E8ECF1] bg-[#F5F6FA] px-3 py-1.5 text-xs text-[#5A6578] transition hover:bg-[#E8ECF1]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#E8ECF1] p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about equipment health..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-[#E8ECF1] px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:ring-2 focus:ring-[#0D8070] disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-[#0D8070] p-2 text-white transition hover:bg-[#C4654D] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

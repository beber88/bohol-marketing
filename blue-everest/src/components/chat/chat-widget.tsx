"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm David, your Panglao Prime Villas consultant. Ask me anything about the project, the returns or the investment. I reply in English or Hebrew.",
};

const QUICK_REPLIES = [
  "How much is a villa and what is the ROI?",
  "Tell me about the project",
  "How does ownership work for foreigners?",
];

function detectLanguage(text: string): "he" | "en" {
  return /[֐-׿]/.test(text) ? "he" : "en";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now())
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  // Gentle teaser bubble to invite the conversation
  useEffect(() => {
    if (teaserDismissed) return;
    const t = setTimeout(() => setShowTeaser(true), 4000);
    return () => clearTimeout(t);
  }, [teaserDismissed]);

  const openChat = () => {
    setOpen(true);
    setShowTeaser(false);
    setTeaserDismissed(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/marketing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          conversationHistory: next.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("request failed");

      const data = await response.json();
      const reply =
        data.reply ||
        data.message ||
        data.response ||
        "Sorry, I could not process that. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I hit a technical issue. You can reach our team directly on WhatsApp: " +
            SITE_CONFIG.whatsapp.marketing +
            " / " +
            SITE_CONFIG.whatsapp.office,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Launcher (closed state) */}
      {!open && (
        <div className="fixed bottom-6 start-6 z-50 flex flex-col items-start gap-3">
          {showTeaser && (
            <div className="relative max-w-[230px] rounded-2xl rounded-bl-sm bg-surface border border-stroke shadow-xl px-4 py-3 text-sm text-text-primary animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={() => {
                  setShowTeaser(false);
                  setTeaserDismissed(true);
                }}
                className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-stroke text-text-primary flex items-center justify-center"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
              Hi, I'm David. Questions about the Panglao villas?
            </div>
          )}
          <button
            onClick={openChat}
            className="group flex items-center gap-3 rounded-full ps-2 pe-5 py-2 bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            aria-label="Chat with David"
          >
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-bg/20">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#4E85BF] font-semibold text-lg">
                D
              </span>
              <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#4E85BF]" />
            </span>
            <span className="text-sm font-medium whitespace-nowrap">
              Chat with David
            </span>
          </button>
        </div>
      )}

      {/* Panel (open state) */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:start-6 sm:bottom-6 z-50 flex flex-col w-auto sm:w-[380px] h-[78vh] max-h-[620px] rounded-2xl overflow-hidden bg-bg border border-stroke shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white">
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#4E85BF] font-semibold text-lg shrink-0">
              D
              <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#4E85BF]" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold leading-tight">David</div>
              <div className="text-xs text-white/80 leading-tight">
                Investment Consultant - AI
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-bg">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const dir = detectLanguage(m.content) === "he" ? "rtl" : "ltr";
              return (
                <div
                  key={i}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    dir={dir}
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white rounded-br-sm"
                        : "bg-surface border border-stroke text-text-primary rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-stroke rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted" />
                </div>
              </div>
            )}

            {/* Quick replies, only before the first user message */}
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    dir={detectLanguage(q) === "he" ? "rtl" : "ltr"}
                    className="text-start text-sm px-3 py-2 rounded-xl border border-stroke text-text-primary hover:bg-surface transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stroke bg-bg px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type a message"
                className="flex-1 resize-none max-h-28 rounded-xl bg-surface border border-stroke px-3 py-2.5 text-sm text-text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-[#4E85BF]"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-center text-[11px] text-muted">
              Prefer WhatsApp?{" "}
              <a
                href={SITE_CONFIG.whatsappLinks.marketing}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-primary"
              >
                Talk to our team
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

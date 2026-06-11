"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Phone, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language?: string;
  metadata?: {
    sources?: string[];
    leadSignals?: string[];
    suggestHandoff?: boolean;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "היי! אני דויד, שמח שנכנסת.\n\nאם אתה מתעניין בווילות בפנגלאו - אני חי ונושם את האי הזה כבר שנים ואשמח לספר לך הכל. שאל אותי מה שבא לך, בעברית או באנגלית.\n\nHey! I'm David. If you're looking into the Panglao villas - just ask me anything. I know this island inside out.",
      timestamp: new Date().toISOString(),
      language: "en",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const detectLanguage = (text: string): "he" | "en" => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text) ? "he" : "en";
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
      language: detectLanguage(trimmed),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/marketing/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          conversationHistory: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply || data.message || data.response || "I could not process your request. Please try again.",
        timestamp: new Date().toISOString(),
        language: data.language || "en",
        metadata: {
          sources: data.sources || data.suggestedActions,
          leadSignals: data.leadQualification?.signals || data.leadSignals,
          suggestHandoff: data.suggestHandoff || (data.leadQualification?.status === "hot"),
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "סליחה, נתקלתי בבעיה טכנית. בינתיים אפשר לדבר ישירות עם הצוות שלנו בוואטסאפ ולקבל תשובות מיידיות:\n\n+639542555553\n+639958565865\n\nSorry, hit a technical snag. You can reach our team directly on WhatsApp for immediate answers.",
          timestamp: new Date().toISOString(),
          language: "en",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-sm sticky top-0 z-10">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">
              Panglao Prime Villas
            </h1>
            <p className="text-xs text-white/50">
              Investment Consultant - AI Powered
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href="https://wa.me/+639542555553"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600/20 text-green-400 text-xs hover:bg-green-600/30 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-amber-600/20 text-white border border-amber-600/30"
                  : "bg-white/5 text-white/90 border border-white/10"
              }`}
              dir={msg.language === "he" ? "rtl" : "ltr"}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
              {msg.metadata?.suggestHandoff && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <a
                    href="https://wa.me/+639542555553"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 text-green-400 text-xs hover:bg-green-600/30 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Talk to our team on WhatsApp
                  </a>
                </div>
              )}
              {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-[10px] text-white/30">
                    Sources: {msg.metadata.sources.join(", ")}
                  </p>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white/70" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {[
              "אני מתעניין, ספר לי על הפרויקט",
              "כמה עולה וילה ומה התשואה?",
              "I want to invest, give me the details",
              "How does this compare to other markets?",
              "What does ownership look like for foreigners?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => {
                    handleSend();
                  }, 100);
                }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                dir={detectLanguage(q) === "he" ? "rtl" : "ltr"}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-[#0a0a0a]">
        <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about pricing, ROI, location, ownership..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none max-h-32 min-h-[40px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-2">
          AI-powered assistant. For detailed discussions, contact us on{" "}
          <a href="https://wa.me/+639542555553" className="underline">
            WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}

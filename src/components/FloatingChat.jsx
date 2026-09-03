import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Trash2, X, Sparkles } from "lucide-react";
import { aiHeaders, getAiVisitorId } from "../lib/aiVisitor";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const welcome = {
  role: "assistant",
  content: "Hi! Main SkillSwap AI Assistant hoon 🤖. Aap Hindi, English ya Hinglish mein skills explore karne, skill request banane ya platform guide ke baare mein pooch sakte hain!",
};

const SUGGESTIONS = [
  "How does SkillSwap work?",
  "How can I add a skill?",
  "Find React & UI design swaps",
];

function MessageText({ content }) {
  // Format bold text and URLs
  const lines = String(content || "").split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} className="h-1.5" />;
        const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s]+)/g);
        return (
          <p key={lIdx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("http")) {
                return (
                  <a
                    key={pIdx}
                    href={part}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-medium text-violet-300 underline underline-offset-2 hover:text-white"
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([welcome]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(`${API}/api/ai/conversation?visitorId=${encodeURIComponent(getAiVisitorId())}`, {
      headers: aiHeaders(),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.messages?.length) setMessages(data.messages);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const message = (textToSend || input).trim();
    if (!message || loading) return;
    const next = [...messages, { role: "user", content: message }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders() },
        body: JSON.stringify({ message, visitorId: getAiVisitorId() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "AI request failed.");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "AI response generate nahi ho paaya. Kripya thodi der mein try karein.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([welcome]);
    try {
      await fetch(`${API}/api/ai/conversation?visitorId=${encodeURIComponent(getAiVisitorId())}`, {
        method: "DELETE",
        headers: aiHeaders(),
      });
    } catch {
      /* local view is cleared */
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2.5 rounded-full bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-900/30 transition-all hover:shadow-purple-900/50 hover:scale-105"
        >
          <Bot size={20} className="animate-pulse" />
          <span>Ask SkillSwap AI</span>
        </button>
      )}

      {open && (
        <section className="flex h-[min(620px,calc(100vh-2.5rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/15 bg-linear-to-b from-[#191226] to-[#0e0a16] shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 text-white bg-white/5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-md">
                <Bot size={20} />
              </span>
              <div>
                <p className="text-sm font-bold leading-none">SkillSwap AI</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Groq Powered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-lg px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition"
                title="Clear chat history"
              >
                <Trash2 className="mr-1 inline" size={13} />
                Clear
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Messages container */}
          <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4 scroll-smooth">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto rounded-br-xs bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-md"
                    : "mr-auto rounded-bl-xs border border-white/10 bg-white/10 text-white/90 shadow-sm"
                }`}
              >
                <MessageText content={message.content} />
              </div>
            ))}

            {loading && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white/80">
                <Loader2 size={16} className="animate-spin text-violet-400" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips (when only welcome message) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2">
              <p className="text-[11px] font-medium text-white/50 mb-1.5 flex items-center gap-1">
                <Sparkles size={11} className="text-yellow-400" /> Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="text-left text-xs bg-white/10 hover:bg-violet-600/50 border border-white/10 text-purple-200 hover:text-white rounded-xl px-2.5 py-1 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-white/10 p-3 bg-white/5"
          >
            <div className="flex gap-2 rounded-2xl border border-white/15 bg-white/10 p-1">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                placeholder="Ask about skills in Hindi or English…"
              />
              <button
                aria-label="Send message"
                className="rounded-xl bg-violet-600 p-2.5 text-white transition hover:bg-violet-500 disabled:opacity-50"
                disabled={loading || !input.trim()}
                type="submit"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}


import { useState, useRef, useEffect, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, X, Send, Sparkles, Loader2 } from "lucide-react";
import { sendChatMessage } from "../../services/aiChatService";
import { cn } from "../../utils/cn";

interface ChatMessage { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "What invoices are overdue?",
  "Generate a revenue report",
  "Summarize expenses",
  "Find duplicate payments",
  "What workflows failed today?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your FinFlow AI finance assistant. Ask me about overdue invoices, revenue, expenses, duplicate payments, or failed workflows." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that right now." }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquareText className="h-5.5 w-5.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="glass-panel fixed bottom-24 right-6 z-40 flex h-[520px] w-96 flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <p className="font-display text-sm font-semibold">Finance Assistant</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm", m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200")}>
                  {m.content}
                </div>
              ))}
              {loading && <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...</div>}
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 p-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about invoices, revenue, expenses..." className="input-base flex-1 !py-2 text-sm" />
              <button type="submit" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

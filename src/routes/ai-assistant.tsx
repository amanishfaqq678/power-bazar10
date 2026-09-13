import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { askAssistant, EXAMPLE_QUESTIONS, AssistantReply } from "@/services/aiAssistant";
import { createFileRoute } from "@tanstack/react-router";

function AIAssistantPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = question.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    try {
      const reply: AssistantReply = await askAssistant(q);
      setMessages((m) => [...m, { role: "assistant", text: reply.answer }]);
      if (reply.recommendations.length > 0) {
        for (const rec of reply.recommendations) {
          setMessages((m) => [
            ...m,
            { role: "assistant", text: `• ${rec.product.name} — ${rec.reason}` },
          ]);
        }
      }
      if (reply.recommendations.length === 0) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "No catalogue matches found — try browsing products or sending a quote request.",
          },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "There was an error contacting the assistant. Please try again later.",
        },
      ]);
      // Keep error silent to avoid leaking internals
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <div className="container-pb section-pb">
        <section className="mx-auto max-w-3xl">
          <div className="motion-fade-up mb-8">
            <p className="eyebrow">Product guidance</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Power Bazar Product Assistant</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Describe what you need and the assistant will suggest catalogue items to consider.
          </p></div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-4 text-sm font-bold"><Sparkles className="size-4 text-primary" aria-hidden="true" /> Ask about products in the catalogue</div>
            <div className="mb-4 min-h-28 space-y-3" aria-live="polite">
              {messages.length === 0 ? (
                <div className="rounded-xl bg-surface p-4 text-sm text-muted-foreground">Try an example: {EXAMPLE_QUESTIONS[0]}</div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 ${m.role === "user" ? "bg-primary/10" : "bg-surface"}`}
                  >
                    <div className={`text-sm ${m.role === "user" ? "font-medium" : ""}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={question}
                placeholder="Ask about products, e.g. 'I need LED lights for a shop'"
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading}
              />
              <Button onClick={() => void send()} disabled={loading} aria-label={loading ? "Searching" : "Send"}>{loading ? "Searching..." : <><Send className="size-4" aria-hidden="true" /> Send</>}</Button>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <a href="/products" className="font-bold text-primary hover:underline">
                Browse Products
              </a>
              {/* Request Quote link omitted unless route exists */}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Example questions</h3>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className="rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold transition-colors hover:border-primary hover:text-primary"
                    onClick={() => setQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

export const Route = createFileRoute("/ai-assistant")({
  component: AIAssistantPage,
});

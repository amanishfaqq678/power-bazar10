import React, { useState } from "react";
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
      <div className="container-pb py-12">
        <section className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Power Bazar Product Assistant</h1>
          <p className="text-muted mb-6">
            Describe what you need and the assistant will suggest catalogue items to consider.
          </p>

          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="space-y-3 mb-4">
              {messages.length === 0 ? (
                <div className="text-sm text-muted">Try an example: {EXAMPLE_QUESTIONS[0]}</div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded ${m.role === "user" ? "bg-green-50 self-end" : "bg-gray-50"}`}
                  >
                    <div className={`text-sm ${m.role === "user" ? "font-medium" : ""}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                className="flex-1 input"
                value={question}
                placeholder="Ask about products, e.g. 'I need LED lights for a shop'"
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading}
              />
              <button className="btn btn-primary" onClick={send} disabled={loading}>
                {loading ? "Searching..." : "Send"}
              </button>
            </div>

            <div className="mt-4 text-sm text-muted">
              <a href="/products" className="underline text-primary">
                Browse Products
              </a>
              {/* Request Quote link omitted unless route exists */}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Example questions</h3>
              <div className="flex gap-2 flex-wrap">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className="btn btn-secondary btn-sm"
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

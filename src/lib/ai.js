// ══════════════════════════════════════
// AI helper — calls Anthropic Messages API
// API key is injected via Vite env: VITE_ANTHROPIC_API_KEY
// ══════════════════════════════════════

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

function buildPrompt({ type, amount, category, note, lang }) {
  const langName = lang === "ar" ? "Arabic" : "English";
  return `You are a friendly personal finance assistant.
The user just recorded a transaction:
- Type: ${type}
- Amount: $${amount}
- Category: ${category}
- Note: ${note || "(none)"}

Language: ${langName}

If income: write an encouraging short message (1-2 sentences max).
If expense on Entertainment/Shopping: gently remind them to be mindful of spending.
If expense on Health/Education: praise the investment in themselves.
If expense on Food/Transport/Bills: neutral acknowledgment.

Keep it warm, human, and concise. No emojis unless it feels natural.`;
}

/**
 * getAIMessage — request an AI message about a transaction.
 * Silently returns null on failure so UI can skip displaying anything.
 *
 * @param {{ type:string, amount:number, category:string, note?:string, lang?:string }} txn
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<string|null>}
 */
export async function getAIMessage(txn, options = {}) {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(API_URL, {
      method: "POST",
      signal: options.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: buildPrompt(txn),
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    // Anthropic response: { content: [{ type: "text", text: "..." }, ...] }
    const text = Array.isArray(data?.content)
      ? data.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim()
      : "";
    return text || null;
  } catch {
    // Silently skip — never block the UI
    return null;
  }
}

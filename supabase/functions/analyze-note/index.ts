// Supabase Edge Function (Deno): analyze-note
//
// Приймає текст нотатки клієнта, викликає LLM (OpenAI за замовчуванням) і
// повертає строго типізований JSON { summary, tags, sentiment }.
//
// LLM API-ключ живе ЛИШЕ тут, як секрет середовища виконання Edge Function
// (`supabase secrets set OPENAI_API_KEY=...`), і ніколи не потрапляє на
// фронтенд.
//
// Деплой:
//   supabase functions deploy analyze-note
//   supabase secrets set OPENAI_API_KEY=sk-...

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
// Base URL можна перевизначити, щоб використати будь-який OpenAI-сумісний
// провайдер (Groq, Google Gemini через OpenAI-endpoint, OpenRouter тощо).
const OPENAI_API_URL = Deno.env.get("OPENAI_BASE_URL") ??
  "https://api.openai.com/v1/chat/completions";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SENTIMENTS = ["positive", "neutral", "negative"] as const;
type Sentiment = (typeof SENTIMENTS)[number];

interface NoteAiAnalysis {
  summary: string;
  tags: string[];
  sentiment: Sentiment;
}

const SYSTEM_PROMPT = `Ти — асистент CRM-системи. Твоє завдання — проаналізувати нотатку
менеджера про клієнта і повернути СТРОГО валідний JSON без жодного додаткового
тексту, markdown або пояснень. Формат відповіді:

{
  "summary": "одне речення українською, що узагальнює нотатку",
  "tags": ["тег1", "тег2"],
  "sentiment": "positive" | "neutral" | "negative"
}

Правила:
- "tags" — масив з 2 або 3 коротких тегів українською (наприклад: "зацікавлений",
  "потребує follow-up", "великий бюджет", "не готовий купувати", "лояльний клієнт").
- "sentiment" — лише одне з трьох значень: positive, neutral, negative.
- Відповідай ЛИШЕ JSON-об'єктом, без пояснень.`;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/** Безпечний парсинг: LLM іноді обгортає JSON у markdown-код-блок. */
function safeParseAnalysis(raw: string): NoteAiAnalysis | null {
  const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();

  let candidate: unknown;
  try {
    candidate = JSON.parse(cleaned);
  } catch {
    return null;
  }

  if (typeof candidate !== "object" || candidate === null) return null;
  const obj = candidate as Record<string, unknown>;

  const summary = obj.summary;
  const tags = obj.tags;
  const sentiment = obj.sentiment;

  if (typeof summary !== "string" || summary.trim().length === 0) return null;
  if (!Array.isArray(tags) || tags.length < 2 || tags.length > 3) return null;
  if (!tags.every((tag) => typeof tag === "string" && tag.trim().length > 0)) return null;
  if (typeof sentiment !== "string" || !SENTIMENTS.includes(sentiment as Sentiment)) return null;

  return {
    summary: summary.trim(),
    tags: tags.map((tag) => (tag as string).trim()),
    sentiment: sentiment as Sentiment,
  };
}

async function callOpenAi(text: string): Promise<NoteAiAnalysis> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY не налаштовано в секретах Edge Function");
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API помилка (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const content: string | undefined = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI не повернув контент відповіді");
  }

  const analysis = safeParseAnalysis(content);
  if (!analysis) {
    throw new Error("OpenAI повернув невалідний JSON");
  }

  return analysis;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Метод не підтримується, очікується POST" }, 405);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Тіло запиту повинно бути валідним JSON" }, 400);
  }

  const text = (body as Record<string, unknown> | null)?.text;
  if (typeof text !== "string" || text.trim().length === 0) {
    return jsonResponse({ error: "Поле 'text' обов'язкове і повинно бути непорожнім рядком" }, 400);
  }

  try {
    const analysis = await callOpenAi(text);
    return jsonResponse(analysis, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Невідома помилка AI-аналізу";
    console.error("analyze-note error:", message);
    return jsonResponse({ error: message }, 502);
  }
});

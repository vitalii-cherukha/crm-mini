/**
 * Єдине джерело типів застосунку.
 * Типи узгоджені зі схемою БД Supabase (див. crm-mini-backend/supabase/migrations).
 */

export const CLIENT_STATUSES = ["new", "in_progress", "closed"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

export interface Client {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  status: ClientStatus;
  created_at: string;
}

/** Поля, потрібні для створення клієнта (решта заповнюється БД). */
export type NewClient = Pick<Client, "name" | "status"> &
  Partial<Pick<Client, "company" | "phone" | "email">>;

export interface Note {
  id: string;
  client_id: string;
  text: string;
  ai_summary: string | null;
  ai_tags: string[] | null;
  ai_sentiment: Sentiment | null;
  created_at: string;
}

/** Поля, потрібні для створення нотатки (AI-поля додаються після аналізу). */
export type NewNote = Pick<Note, "client_id" | "text">;

/**
 * Строго типізований результат аналізу нотатки LLM.
 * Саме такий JSON має повертати Edge Function / ai.ts.
 */
export interface NoteAiAnalysis {
  summary: string;
  tags: string[];
  sentiment: Sentiment;
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  new: "Новий",
  in_progress: "В роботі",
  closed: "Закритий",
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: "Позитивний",
  neutral: "Нейтральний",
  negative: "Негативний",
};

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { SENTIMENTS, type NoteAiAnalysis } from "@/lib/types";

/**
 * ВАЖЛИВО ПРО БЕЗПЕКУ: LLM API-ключ НІКОЛИ не зберігається і не використовується
 * на фронтенді. Цей файл — єдина точка входу для AI-аналізу нотаток з боку
 * клієнта, і він лише викликає Supabase Edge Function `analyze-note`
 * (Deno-функція в репозиторії crm-mini-backend/supabase/functions/analyze-note),
 * яка тримає ключ у себе як секрет середовища виконання.
 *
 * Якщо Edge Function з якоїсь причини недоступна (немає розгорнутого проєкту,
 * локальна розробка без `supabase functions serve` тощо), заміни лише тіло
 * функції `analyzeNoteText` нижче на прямий виклик власного бекенд-ендпоінта —
 * решта застосунку (hooks/components) від цього не залежить.
 */

const noteAiAnalysisSchema = z.object({
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(2).max(3),
  sentiment: z.enum(SENTIMENTS),
});

interface AnalyzeNoteSuccess {
  ok: true;
  data: NoteAiAnalysis;
}

interface AnalyzeNoteFailure {
  ok: false;
  error: string;
}

export type AnalyzeNoteResult = AnalyzeNoteSuccess | AnalyzeNoteFailure;

/**
 * Відправляє текст нотатки на аналіз LLM через Edge Function та повертає
 * строго типізований результат. Ніколи не кидає виняток — усі помилки
 * (мережеві, невалідний JSON від LLM тощо) повертаються як `{ ok: false }`,
 * щоб викликаючий код міг безпечно зберегти нотатку без AI-даних.
 */
export async function analyzeNoteText(text: string): Promise<AnalyzeNoteResult> {
  try {
    const { data, error } = await supabase.functions.invoke<unknown>("analyze-note", {
      body: { text },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const parsed = noteAiAnalysisSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "AI повернув відповідь у неочікуваному форматі" };
    }

    return { ok: true, data: parsed.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Невідома помилка AI-аналізу";
    return { ok: false, error: message };
  }
}

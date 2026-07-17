import { useCallback, useEffect, useState } from "react";
import { analyzeNoteText } from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/lib/types";

const NOTE_COLUMNS = "id, client_id, text, ai_summary, ai_tags, ai_sentiment, created_at";

interface AddNoteOutcome {
  note: Note;
  aiFailed: boolean;
  aiError?: string;
}

interface UseNotesResult {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  isAddingNote: boolean;
  addNote: (text: string) => Promise<AddNoteOutcome>;
  refetch: () => Promise<void>;
}

export function useNotes(clientId: string | undefined): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("notes")
      .select(NOTE_COLUMNS)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setNotes(data);
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(
    async (text: string): Promise<AddNoteOutcome> => {
      if (!clientId) {
        throw new Error("Не вказано ідентифікатор клієнта");
      }

      setIsAddingNote(true);
      try {
        // AI-аналіз ніколи не блокує збереження нотатки: невдалий аналіз
        // призводить лише до порожніх ai_* полів (обробляється в analyzeNoteText).
        const analysis = await analyzeNoteText(text);

        const { data, error: insertError } = await supabase
          .from("notes")
          .insert({
            client_id: clientId,
            text,
            ai_summary: analysis.ok ? analysis.data.summary : null,
            ai_tags: analysis.ok ? analysis.data.tags : null,
            ai_sentiment: analysis.ok ? analysis.data.sentiment : null,
          })
          .select(NOTE_COLUMNS)
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setNotes((previous) => [data, ...previous]);

        return {
          note: data,
          aiFailed: !analysis.ok,
          aiError: analysis.ok ? undefined : analysis.error,
        };
      } finally {
        setIsAddingNote(false);
      }
    },
    [clientId],
  );

  return { notes, isLoading, error, isAddingNote, addNote, refetch: fetchNotes };
}

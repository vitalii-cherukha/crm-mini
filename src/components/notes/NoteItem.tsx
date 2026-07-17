import { Sparkles } from "lucide-react";
import { SentimentIndicator } from "@/components/notes/SentimentIndicator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Note, Sentiment } from "@/lib/types";

interface NoteItemProps {
  note: Note;
}

const SENTIMENT_ACCENT: Record<Sentiment, string> = {
  positive: "border-l-success",
  neutral: "border-l-muted-foreground/40",
  negative: "border-l-destructive",
};

const MONTHS_SHORT_UK = [
  "січ",
  "лют",
  "бер",
  "кві",
  "тра",
  "чер",
  "лип",
  "сер",
  "вер",
  "жов",
  "лис",
  "гру",
] as const;

function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate();
  const month = MONTHS_SHORT_UK[date.getMonth()] ?? "";
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function NoteItem({ note }: NoteItemProps) {
  const hasAiAnalysis = Boolean(note.ai_summary && note.ai_sentiment);
  const accentClass = note.ai_sentiment ? SENTIMENT_ACCENT[note.ai_sentiment] : "border-l-border";

  return (
    <Card className={cn("border-l-4", accentClass)}>
      <CardContent className="grid gap-2 pt-4">
        <div className="flex items-start justify-between gap-4">
          <p className="whitespace-pre-wrap text-sm">{note.text}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatNoteDate(note.created_at)}
          </span>
        </div>

        {hasAiAnalysis ? (
          <div className="mt-1 grid gap-2 border-t pt-2">
            <p className="flex items-start gap-1.5 text-sm italic text-muted-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{note.ai_summary}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {note.ai_sentiment && <SentimentIndicator sentiment={note.ai_sentiment} />}
              {note.ai_tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-1 border-t pt-2">
            <Badge variant="outline" className="text-muted-foreground">
              AI-аналіз недоступний
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { SentimentIndicator } from "@/components/notes/SentimentIndicator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Note } from "@/lib/types";

interface NoteItemProps {
  note: Note;
}

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function NoteItem({ note }: NoteItemProps) {
  const hasAiAnalysis = Boolean(note.ai_summary && note.ai_sentiment);

  return (
    <Card>
      <CardContent className="grid gap-2 pt-4">
        <div className="flex items-start justify-between gap-4">
          <p className="whitespace-pre-wrap text-sm">{note.text}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {dateFormatter.format(new Date(note.created_at))}
          </span>
        </div>

        {hasAiAnalysis ? (
          <div className="mt-1 grid gap-2 border-t pt-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">AI-резюме: </span>
              {note.ai_summary}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {note.ai_sentiment && <SentimentIndicator sentiment={note.ai_sentiment} />}
              {note.ai_tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-1 border-t pt-2 text-xs text-muted-foreground">
            AI-аналіз недоступний для цієї нотатки.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

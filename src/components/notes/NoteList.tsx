import { NoteItem } from "@/components/notes/NoteItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/lib/types";

interface NoteListProps {
  notes: Note[];
  isLoading: boolean;
}

export function NoteList({ notes, isLoading }: NoteListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">Нотаток ще немає.</p>;
  }

  return (
    <div className="grid gap-3">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}

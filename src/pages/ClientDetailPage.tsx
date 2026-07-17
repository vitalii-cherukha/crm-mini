import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/clients/StatusBadge";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteList } from "@/components/notes/NoteList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/hooks/useClient";
import { useNotes } from "@/hooks/useNotes";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { client, isLoading: isClientLoading, error: clientError } = useClient(id);
  const { notes, isLoading: areNotesLoading, isAddingNote, addNote } = useNotes(id);

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/">
          <ArrowLeft />
          До списку клієнтів
        </Link>
      </Button>

      {isClientLoading && (
        <div className="mb-8 grid gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
      )}

      {clientError && !isClientLoading && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {clientError}
        </p>
      )}

      {client && !isClientLoading && (
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <dl className="mt-2 grid gap-1 text-sm text-muted-foreground">
            {client.company && <dd>Компанія: {client.company}</dd>}
            {client.phone && <dd>Телефон: {client.phone}</dd>}
            {client.email && <dd>Email: {client.email}</dd>}
          </dl>
        </div>
      )}

      <div className="grid gap-6">
        <section>
          <h2 className="mb-3 text-lg font-medium">Нова нотатка</h2>
          <NoteForm onAddNote={addNote} isSubmitting={isAddingNote} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium">Історія нотаток</h2>
          <NoteList notes={notes} isLoading={areNotesLoading} />
        </section>
      </div>
    </div>
  );
}

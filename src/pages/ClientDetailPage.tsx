import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { ClientStatusSelect } from "@/components/clients/ClientStatusSelect";
import { NoteForm } from "@/components/notes/NoteForm";
import { NoteList } from "@/components/notes/NoteList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/hooks/useClient";
import { useNotes } from "@/hooks/useNotes";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    client,
    isLoading: isClientLoading,
    error: clientError,
    updateStatus,
  } = useClient(id);
  const { notes, isLoading: areNotesLoading, isAddingNote, addNote } = useNotes(id);

  return (
    <div className="grid gap-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/">
          <ArrowLeft />
          До списку клієнтів
        </Link>
      </Button>

      {isClientLoading && (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </CardContent>
        </Card>
      )}

      {clientError && !isClientLoading && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {clientError}
        </p>
      )}

      {client && !isClientLoading && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 pt-6">
            <ClientAvatar name={client.name} className="h-12 w-12 text-base" />
            <div className="grid gap-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{client.name}</h1>
                <ClientStatusSelect
                  status={client.status}
                  onStatusChange={updateStatus}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                {client.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {client.company}
                  </span>
                )}
                {client.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Нова нотатка</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm onAddNote={addNote} isSubmitting={isAddingNote} />
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Історія нотаток</h2>
        <NoteList notes={notes} isLoading={areNotesLoading} />
      </section>
    </div>
  );
}

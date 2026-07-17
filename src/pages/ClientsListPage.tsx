import { UserPlus } from "lucide-react";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";

export function ClientsListPage() {
  const { clients, isLoading, error, addClient } = useClients();

  const showEmptyState = !isLoading && !error && clients.length === 0;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Клієнти</h1>
          <p className="text-sm text-muted-foreground">
            Список клієнтів та їхній поточний статус у роботі.
          </p>
        </div>
        <AddClientDialog onAddClient={addClient} />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Не вдалося завантажити клієнтів: {error}
        </p>
      )}

      {showEmptyState && (
        <Card className="items-center border-dashed py-16">
          <CardContent className="flex flex-col items-center gap-3 pt-0 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Ще немає клієнтів</p>
              <p className="text-sm text-muted-foreground">
                Додайте першого клієнта, щоб почати роботу.
              </p>
            </div>
            <AddClientDialog onAddClient={addClient} />
          </CardContent>
        </Card>
      )}

      {!error && !showEmptyState && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">
              Клієнти{!isLoading ? ` · ${clients.length}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ClientsTable clients={clients} isLoading={isLoading} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

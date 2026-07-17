import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { useClients } from "@/hooks/useClients";

export function ClientsListPage() {
  const { clients, isLoading, error, addClient } = useClients();

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Клієнти</h1>
          <p className="text-sm text-muted-foreground">
            Список клієнтів та їхній поточний статус у роботі.
          </p>
        </div>
        <AddClientDialog onAddClient={addClient} />
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Не вдалося завантажити клієнтів: {error}
        </p>
      ) : (
        <div className="rounded-lg border">
          <ClientsTable clients={clients} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

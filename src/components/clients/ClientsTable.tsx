import { useNavigate } from "react-router-dom";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { ClientStatusSelect } from "@/components/clients/ClientStatusSelect";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client, ClientStatus } from "@/lib/types";

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onUpdateStatus: (clientId: string, status: ClientStatus) => Promise<void>;
}

const SKELETON_ROWS = 5;

export function ClientsTable({ clients, isLoading, onUpdateStatus }: ClientsTableProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Імʼя</TableHead>
          <TableHead>Компанія</TableHead>
          <TableHead>Телефон</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Статус</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-full max-w-40" />
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!isLoading && clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Клієнтів ще немає. Додайте першого.
            </TableCell>
          </TableRow>
        )}

        {!isLoading &&
          clients.map((client) => (
            <TableRow
              key={client.id}
              className="cursor-pointer"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <ClientAvatar name={client.name} />
                  {client.name}
                </div>
              </TableCell>
              <TableCell>{client.company ?? "—"}</TableCell>
              <TableCell>{client.phone ?? "—"}</TableCell>
              <TableCell>{client.email ?? "—"}</TableCell>
              <TableCell>
                <ClientStatusSelect
                  status={client.status}
                  onStatusChange={(status) => onUpdateStatus(client.id, status)}
                />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

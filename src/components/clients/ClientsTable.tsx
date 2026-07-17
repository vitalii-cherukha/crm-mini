import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/clients/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/lib/types";

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
}

const SKELETON_ROWS = 5;

export function ClientsTable({ clients, isLoading }: ClientsTableProps) {
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
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.company ?? "—"}</TableCell>
              <TableCell>{client.phone ?? "—"}</TableCell>
              <TableCell>{client.email ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={client.status} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

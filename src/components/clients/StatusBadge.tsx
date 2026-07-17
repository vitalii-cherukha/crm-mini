import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/lib/types";

const STATUS_VARIANT: Record<ClientStatus, "info" | "warning" | "secondary"> = {
  new: "info",
  in_progress: "warning",
  closed: "secondary",
};

interface StatusBadgeProps {
  status: ClientStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{CLIENT_STATUS_LABELS[status]}</Badge>;
}

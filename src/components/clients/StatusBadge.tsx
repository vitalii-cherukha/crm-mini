import { Badge } from "@/components/ui/badge";
import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/lib/types";

const STATUS_VARIANT: Record<ClientStatus, "secondary" | "default" | "success"> = {
  new: "secondary",
  in_progress: "default",
  closed: "success",
};

interface StatusBadgeProps {
  status: ClientStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{CLIENT_STATUS_LABELS[status]}</Badge>;
}

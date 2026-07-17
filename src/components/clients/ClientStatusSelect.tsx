import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CLIENT_STATUSES, CLIENT_STATUS_LABELS, type ClientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_TRIGGER_CLASS: Record<ClientStatus, string> = {
  new: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25",
  in_progress:
    "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
  closed: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

interface ClientStatusSelectProps {
  status: ClientStatus;
  onStatusChange: (status: ClientStatus) => Promise<void>;
  className?: string;
}

/**
 * Бейдж-стилізований select для зміни статусу клієнта "на місці", без
 * переходу на окрему форму редагування.
 */
export function ClientStatusSelect({ status, onStatusChange, className }: ClientStatusSelectProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function handleValueChange(next: string) {
    if (next === status) return;

    setIsSaving(true);
    try {
      await onStatusChange(next as ClientStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не вдалося оновити статус клієнта";
      toast({ variant: "destructive", title: "Помилка", description: message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    // Клік всередині select не повинен спрацьовувати як клік по рядку таблиці
    // (рядки клієнтів клікабельні для переходу на сторінку клієнта).
    <span
      className="inline-flex"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Select value={status} onValueChange={handleValueChange} disabled={isSaving}>
        <SelectTrigger
          className={cn(
            "h-7 w-auto gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium shadow-none focus:ring-1 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-70",
            STATUS_TRIGGER_CLASS[status],
            className,
          )}
        >
          <SelectValue />
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
        </SelectTrigger>
        <SelectContent>
          {CLIENT_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {CLIENT_STATUS_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  );
}

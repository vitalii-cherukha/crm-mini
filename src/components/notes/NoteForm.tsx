import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { newNoteSchema, type NewNoteFormValues } from "@/lib/validation";

interface NoteFormProps {
  onAddNote: (text: string) => Promise<{ aiFailed: boolean; aiError?: string }>;
  isSubmitting: boolean;
}

const DEFAULT_VALUES: NewNoteFormValues = { text: "" };

export function NoteForm({ onAddNote, isSubmitting }: NoteFormProps) {
  const { toast } = useToast();
  const form = useForm<NewNoteFormValues>({
    resolver: zodResolver(newNoteSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: NewNoteFormValues) {
    const parsed = newNoteSchema.parse(values);
    try {
      const result = await onAddNote(parsed.text);
      form.reset(DEFAULT_VALUES);

      if (result.aiFailed) {
        toast({
          title: "Нотатку збережено без AI-аналізу",
          description: result.aiError ?? "AI-сервіс тимчасово недоступний",
        });
      } else {
        toast({ title: "Нотатку додано та проаналізовано AI" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не вдалося зберегти нотатку";
      toast({ variant: "destructive", title: "Помилка", description: message });
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Опишіть суть розмови з клієнтом..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Sparkles />
            {isSubmitting ? "Аналіз AI..." : "Додати нотатку"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

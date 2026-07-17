import { z } from "zod";
import { CLIENT_STATUSES } from "@/lib/types";

/** Порожній рядок з форми трактуємо як "не заповнено" (null у БД). */
const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const newClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Імʼя повинно містити щонайменше 2 символи")
    .max(120, "Імʼя занадто довге"),
  company: optionalTrimmedString,
  phone: optionalTrimmedString.pipe(
    z
      .string()
      .regex(/^[+\d][\d\s()-]{5,20}$/, "Некоректний формат телефону")
      .optional(),
  ),
  email: optionalTrimmedString.pipe(z.string().email("Некоректний email").optional()),
  status: z.enum(CLIENT_STATUSES),
});

export type NewClientFormValues = z.input<typeof newClientSchema>;

export const newNoteSchema = z.object({
  text: z
    .string()
    .trim()
    .min(3, "Нотатка повинна містити щонайменше 3 символи")
    .max(4000, "Нотатка занадто довга"),
});

export type NewNoteFormValues = z.input<typeof newNoteSchema>;

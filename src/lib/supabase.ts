import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Відсутні VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Перевір файл .env (див. .env.example).",
  );
}

/**
 * Єдиний Supabase-клієнт застосунку. anon key безпечно публічний —
 * реальні права обмежені RLS-політиками таблиць (див. міграції бекенду).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

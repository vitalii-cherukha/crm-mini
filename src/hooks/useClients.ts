import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, NewClient } from "@/lib/types";

interface UseClientsResult {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (input: NewClient) => Promise<Client>;
  refetch: () => Promise<void>;
}

const CLIENT_LIST_COLUMNS = "id, name, company, phone, email, status, created_at";

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("clients")
      .select(CLIENT_LIST_COLUMNS)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setClients(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(async (input: NewClient): Promise<Client> => {
    const { data, error: insertError } = await supabase
      .from("clients")
      .insert({
        name: input.name,
        company: input.company ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        status: input.status,
      })
      .select(CLIENT_LIST_COLUMNS)
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    setClients((previous) => [data, ...previous]);
    return data;
  }, []);

  return { clients, isLoading, error, addClient, refetch: fetchClients };
}

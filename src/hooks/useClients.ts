import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, ClientStatus, NewClient } from "@/lib/types";

interface UseClientsResult {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (input: NewClient) => Promise<Client>;
  updateClientStatus: (clientId: string, status: ClientStatus) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
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

  const updateClientStatus = useCallback(async (clientId: string, status: ClientStatus) => {
    const { data, error: updateError } = await supabase
      .from("clients")
      .update({ status })
      .eq("id", clientId)
      .select(CLIENT_LIST_COLUMNS)
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    setClients((previous) => previous.map((client) => (client.id === clientId ? data : client)));
  }, []);

  const deleteClient = useCallback(async (clientId: string) => {
    const { error: deleteError } = await supabase.from("clients").delete().eq("id", clientId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    setClients((previous) => previous.filter((client) => client.id !== clientId));
  }, []);

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClientStatus,
    deleteClient,
    refetch: fetchClients,
  };
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client, ClientStatus } from "@/lib/types";

const CLIENT_COLUMNS = "id, name, company, phone, email, status, created_at";

interface UseClientResult {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
  updateStatus: (status: ClientStatus) => Promise<void>;
  deleteClient: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useClient(clientId: string | undefined): UseClientResult {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("clients")
      .select(CLIENT_COLUMNS)
      .eq("id", clientId)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    if (!data) {
      setError("Клієнта не знайдено");
      setIsLoading(false);
      return;
    }

    setClient(data);
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    void fetchClient();
  }, [fetchClient]);

  const updateStatus = useCallback(
    async (status: ClientStatus) => {
      if (!clientId) {
        throw new Error("Не вказано ідентифікатор клієнта");
      }

      const { data, error: updateError } = await supabase
        .from("clients")
        .update({ status })
        .eq("id", clientId)
        .select(CLIENT_COLUMNS)
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      setClient(data);
    },
    [clientId],
  );

  const deleteClient = useCallback(async () => {
    if (!clientId) {
      throw new Error("Не вказано ідентифікатор клієнта");
    }

    const { error: deleteError } = await supabase.from("clients").delete().eq("id", clientId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }, [clientId]);

  return { client, isLoading, error, updateStatus, deleteClient, refetch: fetchClient };
}

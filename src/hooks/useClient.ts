import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Client } from "@/lib/types";

interface UseClientResult {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
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
      .select("id, name, company, phone, email, status, created_at")
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

  return { client, isLoading, error, refetch: fetchClient };
}

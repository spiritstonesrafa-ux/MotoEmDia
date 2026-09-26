import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminData() {
  return useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      const [profiles, motos, records, quotes] = await Promise.all([
        supabase.from("profiles").select("user_id, name, email, phone, created_at").order("created_at", { ascending: false }),
        supabase.from("motorcycles").select("id, user_id, manufacturer, model, year, current_mileage"),
        supabase.from("maintenance_records").select("user_id"),
        supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
      ]);
      const err = profiles.error || motos.error || records.error || quotes.error;
      if (err) throw err;
      return {
        profiles: profiles.data ?? [],
        motos: motos.data ?? [],
        records: records.data ?? [],
        quotes: quotes.data ?? [],
      };
    },
  });
}

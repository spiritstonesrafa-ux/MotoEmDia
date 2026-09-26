import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Interval, Moto, Record } from "./moto";

export function useSessionUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", u.user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMoto() {
  return useQuery({
    queryKey: ["moto"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("motorcycles")
        .select("*")
        .eq("user_id", u.user!.id)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Moto | null;
    },
  });
}

export function useRecords() {
  return useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("user_id", u.user!.id)
        .order("service_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Record[];
    },
  });
}

export function useIntervals(motoId: string | undefined) {
  return useQuery({
    queryKey: ["intervals", motoId],
    enabled: !!motoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_intervals")
        .select("category, interval_km")
        .eq("motorcycle_id", motoId!);
      if (error) throw error;
      return (data ?? []) as Interval[];
    },
  });
}

export function useMyQuotes() {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .eq("user_id", u.user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RestaurantLog } from "./types";

type DbRow = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  rating: number | string;
  date_visited: string;
  review: string | null;
  tags: string[] | null;
  created_at: string;
};

function rowToLog(row: DbRow): RestaurantLog {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? undefined,
    rating: Number(row.rating),
    dateVisited: row.date_visited,
    review: row.review ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

export function useRestaurantLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<RestaurantLog[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    async function fetchLogs() {
      const { data, error: e } = await supabase
        .from("restaurant_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (e) {
        setError(e.message);
        setLogs([]);
      } else {
        setLogs((data ?? []).map(rowToLog));
      }
      setLoading(false);
    }

    fetchLogs();

    const channel = supabase
      .channel("restaurant_logs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurant_logs",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const addLog = useCallback(
    async (log: Omit<RestaurantLog, "id" | "createdAt">) => {
      if (!userId) return;
      setError(null);
      const { error: e } = await supabase.from("restaurant_logs").insert({
        user_id: userId,
        name: log.name,
        location: log.location ?? null,
        rating: log.rating,
        date_visited: log.dateVisited,
        review: log.review ?? null,
        tags: log.tags ?? [],
      });
      if (e) setError(e.message);
    },
    [userId, supabase]
  );

  const updateLog = useCallback(
    async (id: string, log: Omit<RestaurantLog, "id" | "createdAt">) => {
      if (!userId) return;
      setError(null);
      const { error: e } = await supabase
        .from("restaurant_logs")
        .update({
          name: log.name,
          location: log.location ?? null,
          rating: log.rating,
          date_visited: log.dateVisited,
          review: log.review ?? null,
          tags: log.tags ?? [],
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (e) setError(e.message);
    },
    [userId, supabase]
  );

  const deleteLog = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      await supabase.from("restaurant_logs").delete().eq("id", id).eq("user_id", userId);
    },
    [userId, supabase]
  );

  return { logs, addLog, updateLog, deleteLog, loading, error };
}

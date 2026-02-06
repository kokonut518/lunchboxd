"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export type EatLaterEntry = {
  id: string;
  name: string;
  location?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
};

type DbRow = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
};

function rowToEntry(row: DbRow): EatLaterEntry {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

export function useEatLater(userId: string | undefined) {
  const [items, setItems] = useState<EatLaterEntry[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: e } = await supabase
      .from("eat_later")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (e) {
      setError(e.message);
      setItems([]);
    } else {
      setItems((data ?? []).map(rowToEntry));
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchItems();

    const channel = supabase
      .channel("eat_later")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "eat_later",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchItems]);

  const addItem = useCallback(
    async (item: Omit<EatLaterEntry, "id" | "createdAt">) => {
      if (!userId) return;
      setError(null);
      const { error: e } = await supabase.from("eat_later").insert({
        user_id: userId,
        name: item.name,
        location: item.location ?? null,
        notes: item.notes ?? null,
        tags: item.tags ?? [],
      });
      if (e) setError(e.message);
      else await fetchItems();
    },
    [userId, supabase, fetchItems]
  );

  const updateItem = useCallback(
    async (id: string, item: Omit<EatLaterEntry, "id" | "createdAt">) => {
      if (!userId) return;
      setError(null);
      const { error: e } = await supabase
        .from("eat_later")
        .update({
          name: item.name,
          location: item.location ?? null,
          notes: item.notes ?? null,
          tags: item.tags ?? [],
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (e) setError(e.message);
      else await fetchItems();
    },
    [userId, supabase, fetchItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      const { error: e } = await supabase
        .from("eat_later")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (e) setError(e.message);
      else await fetchItems();
    },
    [userId, supabase, fetchItems]
  );

  return { items, addItem, updateItem, deleteItem, loading, error };
}


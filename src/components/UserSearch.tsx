"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserResult = { id: string; username: string; full_name: string };

export function UserSearch({ excludeUserId }: { excludeUserId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`)
        .neq("id", excludeUserId)
        .limit(8);
      if (!cancelled) {
        setResults(data ?? []);
        setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, excludeUserId]);

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for people..."
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-sky-500"
      />
      {query.trim() && (
        <div className="mt-2 flex flex-col gap-1 rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
          {loading && (
            <p className="px-2 py-1 text-sm text-gray-400">Searching...</p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-2 py-1 text-sm text-gray-400">No people found.</p>
          )}
          {results.map((person) => (
            <Link
              key={person.id}
              href={`/users/${person.username}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-sky-50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                {person.full_name.charAt(0).toUpperCase()}
              </span>
              <span className="text-gray-900">{person.full_name}</span>
              <span className="text-gray-400">@{person.username}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

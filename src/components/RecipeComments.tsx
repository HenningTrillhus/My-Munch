"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RecipeComment } from "@/lib/recipes/types";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label} ago`;
  }
  return "just now";
}

export function RecipeComments({
  recipeId,
  userId,
  initialComments,
}: {
  recipeId: string;
  userId: string;
  initialComments: RecipeComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "posting">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setStatus("posting");
    setError("");
    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("recipe_comments")
      .insert({ recipe_id: recipeId, user_id: userId, body: trimmed })
      .select("id, body, created_at, user_id, profiles(username, full_name)")
      .single();

    setStatus("idle");
    if (dbError || !data) {
      setError("Couldn't post your comment. Please try again.");
      return;
    }
    setComments([...comments, data as unknown as RecipeComment]);
    setBody("");
  };

  return (
    <div>
      <h2 className="mb-2 font-semibold text-gray-900">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>
      <div className="flex flex-col gap-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 text-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
              {(comment.profiles?.full_name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-medium text-gray-900">
                  {comment.profiles?.full_name ?? "Someone"}
                </span>{" "}
                <span className="text-xs text-gray-400">
                  {timeAgo(comment.created_at)}
                </span>
              </p>
              <p className="text-gray-600">{comment.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none focus:border-sky-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={status === "posting" || !body.trim()}
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Post
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

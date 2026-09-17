"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FollowButton({
  viewerId,
  targetId,
  initiallyFollowing,
}: {
  viewerId: string;
  targetId: string;
  initiallyFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error: dbError } = following
      ? await supabase
          .from("follows")
          .delete()
          .eq("follower_id", viewerId)
          .eq("following_id", targetId)
      : await supabase
          .from("follows")
          .insert({ follower_id: viewerId, following_id: targetId });

    setLoading(false);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setFollowing(!following);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={toggle}
        disabled={loading}
        className={
          following
            ? "rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            : "rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50"
        }
      >
        {following ? "Following" : "Follow"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

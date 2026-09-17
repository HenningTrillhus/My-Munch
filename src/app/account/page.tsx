import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { UserSearch } from "@/components/UserSearch";

type FollowProfile = { id: string; username: string; full_name: string };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "there";
  const initial = displayName.charAt(0).toUpperCase();

  const [{ data: followingRows }, { data: followerRows }, { count: recipeCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("profile:profiles!follows_following_id_fkey(id, username, full_name)")
        .eq("follower_id", user.id),
      supabase
        .from("follows")
        .select("profile:profiles!follows_follower_id_fkey(id, username, full_name)")
        .eq("following_id", user.id),
      supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id),
    ]);

  const following = (followingRows ?? []).map(
    (r) => r.profile,
  ) as unknown as FollowProfile[];
  const followers = (followerRows ?? []).map(
    (r) => r.profile,
  ) as unknown as FollowProfile[];

  return (
    <AppShell initial={initial}>
      <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-8 sm:py-12">
        <Link
          href="/discover"
          className="flex items-center gap-1 text-sm font-medium text-gray-400 transition hover:text-gray-700"
        >
          ← Back
        </Link>

        <UserSearch excludeUserId={user.id} />

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-sky-900/5 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-lg font-semibold text-sky-700">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-gray-900">
                {displayName}
              </h1>
              <p className="truncate text-sm text-gray-500">
                {profile?.username ? `@${profile.username} · ` : ""}
                {user.email}
              </p>
            </div>
            <Link
              href="/account/settings"
              aria-label="Settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-lg transition hover:bg-gray-50"
            >
              ⚙️
            </Link>
          </div>

          <div className="mt-4 flex gap-6 border-t border-gray-100 pt-4 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-900">{followers.length}</strong>{" "}
              followers
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">{following.length}</strong>{" "}
              following
            </span>
          </div>

          {(followers.length > 0 || following.length > 0) && (
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <FollowList title="Following" people={following} />
              <FollowList title="Followers" people={followers} />
            </div>
          )}
        </div>

        <Link
          href="/recipes"
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">📖 My Recipes</p>
            <p className="text-xs text-gray-500">
              {recipeCount ?? 0} recipe{recipeCount === 1 ? "" : "s"}
            </p>
          </div>
          <span className="text-gray-400">→</span>
        </Link>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </main>
    </AppShell>
  );
}

function FollowList({
  title,
  people,
}: {
  title: string;
  people: FollowProfile[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {title}
      </p>
      {people.length === 0 ? (
        <p className="text-xs text-gray-400">Nobody yet.</p>
      ) : (
        <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                href={`/users/${person.username}`}
                className="block truncate text-xs text-sky-700 hover:underline"
              >
                {person.full_name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

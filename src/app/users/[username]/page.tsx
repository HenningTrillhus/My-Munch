import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { FollowButton } from "@/components/FollowButton";
import { RecipeBrowser } from "@/components/RecipeBrowser";
import { RECIPE_CARD_COLUMNS, type RecipeCardData } from "@/lib/recipes/types";
import { CountryFlag } from "@/components/ui/CountryFlag";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const viewerDisplayName = viewerProfile?.full_name ?? user.email ?? "there";
  const initial = viewerDisplayName.charAt(0).toUpperCase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, country")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  if (profile.id === user.id) {
    redirect("/account");
  }

  const [{ data: followers }, { data: following }, { data: myFollow }, { data: recipes }] =
    await Promise.all([
      supabase.from("follows").select("follower_id").eq("following_id", profile.id),
      supabase.from("follows").select("following_id").eq("follower_id", profile.id),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle(),
      supabase
        .from("recipes")
        .select(RECIPE_CARD_COLUMNS)
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);

  const profileInitial = profile.full_name.charAt(0).toUpperCase();

  return (
    <AppShell initial={initial}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <div className="mx-auto mb-8 flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl font-semibold text-sky-700">
            {profileInitial}
            {profile.country && (
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-100">
                <CountryFlag country={profile.country} size={18} />
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {profile.full_name}
            </h1>
            <p className="text-sm text-gray-500">
              @{profile.username}
              {profile.country && (
                <>
                  {" · "}
                  <CountryFlag country={profile.country} size={16} />{" "}
                  {profile.country}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{followers?.length ?? 0}</strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-gray-900">{following?.length ?? 0}</strong>{" "}
              following
            </span>
          </div>
          <FollowButton
            viewerId={user.id}
            targetId={profile.id}
            initiallyFollowing={!!myFollow}
          />
        </div>

        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">
          Recipes by {profile.full_name}
        </h2>
        <RecipeBrowser
          recipes={(recipes ?? []) as unknown as RecipeCardData[]}
          showCreateButton={false}
          emptyMessage="No recipes yet."
        />
      </main>
    </AppShell>
  );
}

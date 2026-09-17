import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { RecipeDetail } from "@/components/RecipeDetail";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "*, owner:profiles(username, full_name, country), recipe_ratings(rating, user_id), recipe_comments(id, body, created_at, user_id, profiles(username, full_name, country))",
    )
    .eq("id", id)
    .order("created_at", {
      ascending: true,
      referencedTable: "recipe_comments",
    })
    .single();

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell initial={initial}>
      <main className="px-4 py-8 sm:py-10">
        <RecipeDetail
          recipe={recipe}
          isOwner={recipe.owner_id === user.id}
          userId={user.id}
        />
      </main>
    </AppShell>
  );
}

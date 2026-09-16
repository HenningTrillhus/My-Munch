import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { RecipeBrowser } from "@/components/RecipeBrowser";
import { RECIPE_CARD_COLUMNS } from "@/lib/recipes/types";

export default async function DiscoverPage() {
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

  const { data: recipes } = await supabase
    .from("recipes")
    .select(RECIPE_CARD_COLUMNS)
    .order("created_at", { ascending: false });

  return (
    <AppShell initial={initial}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Discover Recipes
        </h1>
        <RecipeBrowser
          recipes={recipes ?? []}
          showCreateButton={false}
          emptyMessage="No recipes yet. Be the first to add one!"
        />
      </main>
    </AppShell>
  );
}

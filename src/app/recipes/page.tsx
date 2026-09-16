import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { RecipeBrowser } from "@/components/RecipeBrowser";
import { RECIPE_CARD_COLUMNS } from "@/lib/recipes/types";

export default async function MyRecipesPage() {
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
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell initial={initial}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          My Recipes
        </h1>
        <RecipeBrowser
          recipes={recipes ?? []}
          userId={user.id}
          showCreateButton
          emptyMessage="You haven't added any recipes yet. Create your first one!"
        />
      </main>
    </AppShell>
  );
}

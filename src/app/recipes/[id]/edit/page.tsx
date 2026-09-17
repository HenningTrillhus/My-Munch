import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { EditRecipeForm } from "@/components/EditRecipeForm";

export default async function EditRecipePage({
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
    .select("full_name")
    .eq("id", user.id)
    .single();
  const initial = (profile?.full_name ?? user.email ?? "there")
    .charAt(0)
    .toUpperCase();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "*, owner:profiles(username, full_name, country), recipe_ratings(rating, user_id), recipe_comments(id, body, created_at, user_id, profiles(username, full_name, country))",
    )
    .eq("id", id)
    .single();

  if (!recipe) {
    notFound();
  }

  if (recipe.owner_id !== user.id) {
    redirect(`/recipes/${id}`);
  }

  return (
    <AppShell initial={initial}>
      <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Edit recipe
        </h1>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-sky-900/5 sm:p-8">
          <EditRecipeForm userId={user.id} recipe={recipe} />
        </div>
      </main>
    </AppShell>
  );
}

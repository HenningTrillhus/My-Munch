import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { NewRecipeForm } from "@/components/NewRecipeForm";

export default async function NewRecipePage() {
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

  return (
    <AppShell initial={initial}>
      <main className="mx-auto max-w-lg px-4 py-8 sm:py-10">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          New recipe
        </h1>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-sky-900/5 sm:p-8">
          <NewRecipeForm userId={user.id} />
        </div>
      </main>
    </AppShell>
  );
}

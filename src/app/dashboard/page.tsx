import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export default async function DashboardPage() {
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
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <AppHeader initial={initial} />
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
        <span className="text-4xl">👋</span>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="max-w-sm text-sm text-gray-500">
          Collect your own recipes or see what others are cooking.
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            href="/recipes"
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            My Recipes
          </Link>
          <Link
            href="/discover"
            className="rounded-lg border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            Discover
          </Link>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

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
    <AppShell initial={initial}>
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center sm:py-20">
        <span className="text-4xl">👋</span>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="max-w-sm text-sm text-gray-500">
          Collect your own recipes or see what others are cooking.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/recipes"
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            My Recipes
          </Link>
          <Link
            href="/discover"
            className="rounded-lg border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50"
          >
            Discover
          </Link>
        </div>
      </main>
    </AppShell>
  );
}

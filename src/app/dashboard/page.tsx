import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-orange-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-orange-900/5">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-semibold text-orange-700">
          {initial}
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Welcome, {displayName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.username ? `@${profile.username} — ` : ""}
          {user.email}
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

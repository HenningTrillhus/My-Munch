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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">
        Welcome, {profile?.full_name ?? user.email}
      </h1>
      <p className="text-sm text-black/60">
        {profile?.username ? `@${profile.username} — ` : ""}
        {user.email}
      </p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

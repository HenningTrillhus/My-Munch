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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      {user.user_metadata?.avatar_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.user_metadata.avatar_url}
          alt=""
          className="h-16 w-16 rounded-full"
        />
      )}
      <h1 className="text-2xl font-semibold">
        Welcome, {user.user_metadata?.full_name ?? user.email}
      </h1>
      <p className="text-sm text-black/60">{user.email}</p>
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

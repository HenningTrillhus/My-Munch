import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Welcome</h1>
      {user ? (
        <Link
          href="/dashboard"
          className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/80"
        >
          Go to dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/80"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

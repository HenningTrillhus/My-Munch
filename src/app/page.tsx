import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/discover");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-sky-50 via-white to-white px-4 text-center">
      <span className="text-5xl">🍲</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Munch</h1>
        <p className="text-base text-gray-500">
          A place to share and discover food recipes.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        Get started
      </Link>
    </div>
  );
}

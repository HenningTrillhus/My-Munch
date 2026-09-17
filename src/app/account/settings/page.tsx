import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { AccountSettingsForm } from "@/components/AccountSettingsForm";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, country")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "there";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <AppShell initial={initial}>
      <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-8 sm:py-12">
        <Link
          href="/account"
          className="flex items-center gap-1 text-sm font-medium text-gray-400 transition hover:text-gray-700"
        >
          ← Back
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-sky-900/5 sm:p-8">
          <h1 className="mb-1 text-xl font-semibold text-gray-900">
            Settings
          </h1>
          <p className="mb-6 text-sm text-gray-500">{user.email}</p>

          <AccountSettingsForm
            userId={user.id}
            initialUsername={profile?.username ?? ""}
            initialFullName={profile?.full_name ?? ""}
            initialCountry={profile?.country ?? ""}
          />
        </div>
      </main>
    </AppShell>
  );
}

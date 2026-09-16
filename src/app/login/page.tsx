"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const invalidCredentialsMessage = "Invalid username/email or password.";

    let email = identifier.trim();
    if (!email.includes("@")) {
      const { data: resolvedEmail } = await supabase.rpc("email_for_username", {
        uname: email,
      });
      if (!resolvedEmail) {
        setStatus("error");
        setErrorMessage(invalidCredentialsMessage);
        return;
      }
      email = resolvedEmail;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage(invalidCredentialsMessage);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Username or email"
          autoComplete="username"
          className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
        >
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
      </form>

      <p className="text-sm text-black/60">
        New here?{" "}
        <Link href="/signup" className="font-medium text-black underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

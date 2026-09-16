"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "check-email">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!USERNAME_PATTERN.test(username)) {
      setStatus("error");
      setErrorMessage(
        "Username must be 3-20 characters: letters, numbers, or underscores.",
      );
      return;
    }

    setStatus("loading");
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setStatus("error");
      setErrorMessage("That username is already taken.");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setStatus("error");
      setErrorMessage(signUpError.message);
      return;
    }

    if (signUpData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: signUpData.user.id,
        username,
        full_name: fullName,
      });

      if (profileError) {
        setStatus("error");
        setErrorMessage(
          "Account created, but that username was just taken by someone else. Please log in and set a different username.",
        );
        return;
      }
    }

    if (signUpData.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setStatus("check-email");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      {status === "check-email" ? (
        <p className="max-w-sm text-center text-sm text-black/70">
          Check your inbox — we sent a confirmation link to <strong>{email}</strong>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
          />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            autoComplete="new-password"
            className="rounded-md border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/40"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
          >
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </form>
      )}

      <p className="text-sm text-black/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-black underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

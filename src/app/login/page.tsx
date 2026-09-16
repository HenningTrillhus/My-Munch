"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "choice" | "login" | "signup";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("choice");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        {mode !== "choice" && (
          <button
            onClick={() => setMode("choice")}
            className="self-start text-sm text-black/60 hover:text-black"
          >
            ← Back
          </button>
        )}

        {mode === "choice" && <ChoiceView onPick={setMode} />}
        {mode === "login" && <LoginForm />}
        {mode === "signup" && <SignupForm />}
      </div>
    </div>
  );
}

function ChoiceView({ onPick }: { onPick: (mode: Mode) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="mb-2 text-center text-2xl font-semibold">Welcome</h1>
      <button
        onClick={() => onPick("login")}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
      >
        Log in
      </button>
      <button
        onClick={() => onPick("signup")}
        className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Sign up
      </button>
    </div>
  );
}

function LoginForm() {
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
    </div>
  );
}

function SignupForm() {
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

  if (status === "check-email") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-center text-sm text-black/70">
          Check your inbox — we sent a confirmation link to <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
    </div>
  );
}

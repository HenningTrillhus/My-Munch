"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "choice" | "login" | "signup";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const inputClasses =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20";

const labelClasses = "text-sm font-medium text-gray-700";

const primaryButtonClasses =
  "w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClasses =
  "w-full rounded-lg border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50";

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("choice");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-1">
        <span className="text-3xl">🍲</span>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">My Munch</h1>
        <p className="text-sm text-gray-500">Share and discover recipes</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-sky-900/5 sm:p-8">
        {mode !== "choice" && (
          <button
            onClick={() => setMode("choice")}
            className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-400 transition hover:text-gray-700"
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
      <h2 className="mb-1 text-center text-xl font-semibold text-gray-900">
        Welcome
      </h2>
      <p className="mb-3 text-center text-sm text-gray-500">
        Log in to your account or create a new one
      </p>
      <button onClick={() => onPick("login")} className={primaryButtonClasses}>
        Log in
      </button>
      <button onClick={() => onPick("signup")} className={secondaryButtonClasses}>
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
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-gray-900">Log in</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-identifier" className={labelClasses}>
            Username or email
          </label>
          <input
            id="login-identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="jane_doe or jane@example.com"
            autoComplete="username"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className={labelClasses}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className={inputClasses}
          />
        </div>
        <button type="submit" disabled={status === "loading"} className={primaryButtonClasses}>
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>
        {status === "error" && <ErrorBanner message={errorMessage} />}
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
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-3xl">📬</span>
        <h2 className="text-xl font-semibold text-gray-900">Check your inbox</h2>
        <p className="text-sm text-gray-500">
          We sent a confirmation link to <strong className="text-gray-700">{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-gray-900">Create an account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-username" className={labelClasses}>
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jane_doe"
            autoComplete="username"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-fullname" className={labelClasses}>
            Full name
          </label>
          <input
            id="signup-fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className={labelClasses}>
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            autoComplete="email"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className={labelClasses}>
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className={inputClasses}
          />
        </div>
        <button type="submit" disabled={status === "loading"} className={primaryButtonClasses}>
          {status === "loading" ? "Creating account..." : "Create account"}
        </button>
        {status === "error" && <ErrorBanner message={errorMessage} />}
      </form>
    </div>
  );
}

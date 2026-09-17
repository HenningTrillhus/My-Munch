"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COMMON_COUNTRIES } from "@/lib/recipes/types";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const inputClasses =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20";

const labelClasses = "text-sm font-medium text-gray-700";

export function AccountSettingsForm({
  userId,
  initialUsername,
  initialFullName,
  initialCountry,
}: {
  userId: string;
  initialUsername: string;
  initialFullName: string;
  initialCountry: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName);
  const [country, setCountry] = useState(initialCountry);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!USERNAME_PATTERN.test(username)) {
      setStatus("error");
      setMessage("Username must be 3-20 characters: letters, numbers, or underscores.");
      return;
    }

    setStatus("loading");
    const supabase = createClient();

    if (username !== initialUsername) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", userId)
        .maybeSingle();

      if (existing) {
        setStatus("error");
        setMessage("That username is already taken.");
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username, full_name: fullName, country: country.trim() || null })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      setMessage("Something went wrong saving your changes.");
      return;
    }

    setStatus("success");
    setMessage("Saved.");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-username" className={labelClasses}>
          Username
        </label>
        <input
          id="account-username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-fullname" className={labelClasses}>
          Full name
        </label>
        <input
          id="account-fullname"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="account-country" className={labelClasses}>
          Country (optional)
        </label>
        <input
          id="account-country"
          type="text"
          list="account-country-options"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. Norway"
          className={inputClasses}
        />
        <datalist id="account-country-options">
          {COMMON_COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Saving..." : "Save changes"}
      </button>
      {status === "error" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}
      {status === "success" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      )}
    </form>
  );
}

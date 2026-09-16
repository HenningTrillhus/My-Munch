import Link from "next/link";

export function AppHeader({ initial }: { initial: string }) {
  return (
    <header className="flex w-full items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-bold text-gray-900"
      >
        <span className="text-2xl">🍲</span>
        My Munch
      </Link>
      <Link
        href="/account"
        aria-label="Account settings"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 transition hover:bg-orange-200"
      >
        {initial}
      </Link>
    </header>
  );
}

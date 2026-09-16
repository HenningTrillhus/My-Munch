import Link from "next/link";

export function AppHeader({ initial }: { initial: string }) {
  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3.5 backdrop-blur sm:px-6 sm:py-4">
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-bold text-gray-900"
        >
          <span className="text-2xl">🍲</span>
          My Munch
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/recipes" className="transition hover:text-sky-600">
            My Recipes
          </Link>
          <Link href="/discover" className="transition hover:text-sky-600">
            Discover
          </Link>
        </nav>
      </div>
      <Link
        href="/account"
        aria-label="Account settings"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
      >
        {initial}
      </Link>
    </header>
  );
}

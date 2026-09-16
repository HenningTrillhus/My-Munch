import { AppHeader } from "@/components/AppHeader";
import { MobileTabBar } from "@/components/MobileTabBar";

export function AppShell({
  initial,
  children,
}: {
  initial: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-20 sm:pb-0">
      <AppHeader initial={initial} />
      {children}
      <MobileTabBar />
    </div>
  );
}

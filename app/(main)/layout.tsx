"use client";

import dynamic from "next/dynamic";

const ProfileWidget = dynamic(
  () => import("@/components/widgets/ProfileWidget")
);

const NavigationWidget = dynamic(
  () => import("@/components/widgets/NavigationWidget")
);

const PopularHashtagsWidget = dynamic(
  () => import("@/components/widgets/PopularHashtagsWidget")
);

const ProfileAnalyticsWidget = dynamic(
  () => import("@/components/widgets/ProfileAnalyticsWidget")
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background max-w-screen-2xl mx-auto mb-16 md:mb-0 overflow-x-hidden">
      {/* Left Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 p-4">
        <div className="sticky top-4 space-y-4">
          <ProfileWidget />
          <ProfileAnalyticsWidget />
          <NavigationWidget />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto p-4 md:p-6">{children}</div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-72 p-4">
        <div className="sticky top-4 space-y-4">
          <PopularHashtagsWidget />
        </div>
      </aside>
    </div>
  );
}

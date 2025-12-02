"use client";

import dynamic from "next/dynamic";

const ProfileWidget = dynamic(
  () => import("@/components/widgets/ProfileWidget")
);

const NavigationWidget = dynamic(
  () => import("@/components/widgets/NavigationWidget")
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background max-w-screen-2xl mx-auto">
      {/* Left Sidebar */}
      <aside className="hidden md:block w-72 p-4">
        <div className="sticky top-4 space-y-4">
          <ProfileWidget />
          <NavigationWidget />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">{children}</div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden md:block w-72 p-4">
        {/* Future widgets can be added here */}
      </aside>
    </div>
  );
}

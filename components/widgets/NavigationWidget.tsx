"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, BookmarkIcon } from "@heroicons/react/24/solid";

const navigationItems = [
  { name: "Network", href: "/network", icon: UserIcon },
  { name: "Saved", href: "/saved", icon: BookmarkIcon },
];

/**
 * NavigationWidget - Displays navigation links for Network and Saved
 * Used in the left sidebar of shared layouts
 */
export default function NavigationWidget() {
  const pathname = usePathname();

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

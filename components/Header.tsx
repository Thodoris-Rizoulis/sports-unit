"use client";

import React, { useState, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BookmarkIcon,
} from "@heroicons/react/24/solid";
import { SearchUserResult } from "@/types/prisma";
import { Spinner } from "@/components/ui/spinner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { InboxDropdown } from "@/components/messaging/InboxDropdown";
import { InboxBadge } from "@/components/messaging/InboxBadge";
import { useUnreadMessageCount } from "@/hooks/useMessaging";
import { InboxIcon } from "@heroicons/react/24/solid";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Discovery", href: "/discovery", icon: MagnifyingGlassIcon },
];

/**
 * MobileInboxButton Component
 * Shows inbox icon with badge for mobile bottom navigation
 */
function MobileInboxButton({ isActive }: { isActive: boolean }) {
  const { data: unreadData } = useUnreadMessageCount();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <Link
      href="/inbox"
      className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
        isActive
          ? "text-primary bg-accent"
          : "text-muted-foreground hover:text-primary hover:bg-accent"
      }`}
    >
      <div className="relative">
        <InboxIcon className="h-5 w-5" />
        <InboxBadge count={unreadCount} className="-top-1.5 -right-1.5" />
      </div>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsOpen(true);
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/people?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setIsOpen(data.users?.length > 0);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate profile link if user is logged in
  const profileHref =
    session?.user?.publicUuid && session?.user?.username
      ? `/profile/${session.user.publicUuid}/${session.user.username}`
      : null;

  // Hide header on homepage
  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Sports Unit"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground hover:text-primary hover:bg-accent transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <InboxDropdown showLabel={true} />
              <NotificationBell showLabel={true} />
              {profileHref && (
                <Link
                  href={profileHref}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground hover:text-primary hover:bg-accent transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              )}
            </nav>

            {/* Search */}
            <div className="flex-shrink-0 relative">
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    aria-label="Search for people by name or username"
                  />
                </div>
              </div>
              {isOpen && (
                <div className="absolute top-full mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-50">
                  {isLoading ? (
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
                      <Spinner className="h-4 w-4" />
                      <span>Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            window.location.href = `/profile/${user.publicUuid}/${user.username}`;
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent"
                        >
                          <Image
                            src={user.profileImageUrl || "/default_profile.jpg"}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
          <MobileInboxButton isActive={pathname.startsWith("/inbox")} />
          <NotificationBell
            showLabel={false}
            useDropdown={false}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/notifications"
                ? "text-primary bg-accent"
                : "text-muted-foreground hover:text-primary hover:bg-accent"
            }`}
          />
          {profileHref && (
            <Link
              href={profileHref}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                pathname.startsWith("/profile")
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

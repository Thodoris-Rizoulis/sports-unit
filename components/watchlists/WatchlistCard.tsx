"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WatchlistSummary } from "@/types/watchlists";

type WatchlistCardProps = {
  watchlist: WatchlistSummary;
  onEdit?: (watchlist: WatchlistSummary) => void;
  onDelete?: (watchlist: WatchlistSummary) => void;
};

/**
 * Card displaying a watchlist with name, description, and athlete count.
 * Card content area is clickable to navigate to watchlist detail.
 * Includes edit/delete dropdown menu that doesn't interfere with navigation.
 */
export function WatchlistCard({
  watchlist,
  onEdit,
  onDelete,
}: WatchlistCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canSelect, setCanSelect] = useState(false);

  // When menu opens, wait a bit before allowing selections
  useEffect(() => {
    if (isOpen) {
      setCanSelect(false);
      const timer = setTimeout(() => {
        setCanSelect(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setCanSelect(false);
    }
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSelect = (callback: () => void) => (e: Event) => {
    if (!canSelect) {
      e.preventDefault();
      return;
    }
    callback();
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Clickable content area - navigates to watchlist */}
          <Link
            href={`/watchlists/${watchlist.id}`}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {watchlist.name}
            </h3>
            {watchlist.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {watchlist.description}
              </p>
            )}
          </Link>

          {/* Dropdown menu */}
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={handleSelect(() => onEdit?.(watchlist))}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleSelect(() => onDelete?.(watchlist))}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* This area is also clickable for navigation */}
        <Link
          href={`/watchlists/${watchlist.id}`}
          className="block mt-3 cursor-pointer"
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {watchlist.athleteCount} athlete
                {watchlist.athleteCount !== 1 ? "s" : ""}
              </span>
            </div>
            <span>·</span>
            <span>Updated {formatDate(watchlist.updatedAt)}</span>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

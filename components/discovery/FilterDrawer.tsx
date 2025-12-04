"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { useState } from "react";

type FilterDrawerProps = {
  activeFilterCount?: number;
};

/**
 * Mobile filter drawer using shadcn Sheet component.
 * Slides in from the right with the full filter panel.
 */
export function FilterDrawer({ activeFilterCount = 0 }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Athletes</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <DiscoveryFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
}

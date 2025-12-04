"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import type { DiscoverySortOption } from "@/types/discovery";

type SortDropdownProps = {
  className?: string;
};

const sortOptions: { value: DiscoverySortOption; label: string }[] = [
  { value: "recent", label: "Recently Active" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "newest", label: "Newest Members" },
];

/**
 * Sort dropdown for discovery results.
 * Updates URL search params to persist sort preference.
 */
export function SortDropdown({ className }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort =
    (searchParams.get("sort") as DiscoverySortOption) || "recent";

  const handleSortChange = (value: DiscoverySortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    // Reset to page 1 when changing sort
    params.delete("page");
    router.push(`/discovery?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

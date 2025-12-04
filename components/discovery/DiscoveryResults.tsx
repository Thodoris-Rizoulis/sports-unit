"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AthleteCard } from "./AthleteCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type {
  AthleteDiscoveryResult,
  DiscoveryPagination,
} from "@/types/discovery";

type Position = {
  id: number;
  name: string;
  sportId: number;
};

type DiscoveryResultsProps = {
  athletes: AthleteDiscoveryResult[];
  pagination: DiscoveryPagination;
  isLoading?: boolean;
  onAddToWatchlist?: (athleteId: string) => void;
};

/**
 * Discovery results grid with pagination.
 * Displays athlete cards and handles navigation between pages.
 */
export function DiscoveryResults({
  athletes,
  pagination,
  isLoading,
  onAddToWatchlist,
}: DiscoveryResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [positionsMap, setPositionsMap] = useState<Map<number, string>>(
    new Map()
  );

  // Fetch all positions to map IDs to names
  useEffect(() => {
    async function fetchAllPositions() {
      try {
        // Get unique sport IDs from athletes
        const sportIds = new Set(
          athletes
            .filter((a) => a.sportId !== null)
            .map((a) => a.sportId as number)
        );

        if (sportIds.size === 0) return;

        // Fetch positions for each sport
        const allPositions: Position[] = [];
        for (const sportId of sportIds) {
          const res = await fetch(`/api/positions?sportId=${sportId}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              allPositions.push(...data);
            }
          }
        }

        // Build map of position ID to name
        const map = new Map<number, string>();
        for (const pos of allPositions) {
          map.set(pos.id, pos.name);
        }
        setPositionsMap(map);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    }

    if (athletes.length > 0) {
      fetchAllPositions();
    }
  }, [athletes]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/discovery?${params.toString()}`, { scroll: false });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (athletes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No athletes found</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          Try adjusting your filters or clearing them to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} athletes
      </div>

      {/* Athlete cards */}
      <div className="grid gap-4">
        {athletes.map((athlete) => (
          <AthleteCard
            key={athlete.id}
            athlete={athlete}
            onAddToWatchlist={onAddToWatchlist}
            positionsMap={positionsMap}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1) {
                    handlePageChange(pagination.page - 1);
                  }
                }}
                className={
                  pagination.page <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* Page numbers */}
            {getPageNumbers().map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    isActive={pageNum === pagination.page}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next button */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.hasMore) {
                    handlePageChange(pagination.page + 1);
                  }
                }}
                className={
                  !pagination.hasMore
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

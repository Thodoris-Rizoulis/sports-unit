"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WatchlistAthleteCard } from "./WatchlistAthleteCard";
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
  WatchlistAthleteItem,
  WatchlistSummary,
} from "@/types/watchlists";

type WatchlistDetailProps = {
  watchlist: WatchlistSummary;
  athletes: WatchlistAthleteItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading?: boolean;
  onRemoveAthlete?: (athleteId: number) => void;
  isRemovingAthleteId?: number | null;
};

/**
 * Watchlist detail view with athlete list and pagination.
 */
export function WatchlistDetail({
  watchlist,
  athletes,
  pagination,
  isLoading,
  onRemoveAthlete,
  isRemovingAthleteId,
}: WatchlistDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/watchlists/${watchlist.id}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
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
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
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
        <h3 className="text-lg font-semibold">No athletes yet</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          Head to the Discovery page to find and add athletes to this watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {pagination.total} athlete{pagination.total !== 1 ? "s" : ""} in this
        watchlist
      </div>

      {/* Athlete cards */}
      <div className="grid gap-4">
        {athletes.map((athlete) => (
          <WatchlistAthleteCard
            key={athlete.id}
            athlete={athlete}
            onRemove={onRemoveAthlete}
            isRemoving={isRemovingAthleteId === athlete.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
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

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.totalPages) {
                    handlePageChange(pagination.page + 1);
                  }
                }}
                className={
                  pagination.page >= pagination.totalPages
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

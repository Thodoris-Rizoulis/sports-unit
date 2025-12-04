"use client";

import { Suspense, useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import {
  AddToWatchlistModal,
  DiscoveryFilters,
  DiscoveryResults,
  FilterDrawer,
  SortDropdown,
} from "@/components/discovery";
import { useDiscovery } from "@/hooks/useDiscovery";
import { Skeleton } from "@/components/ui/skeleton";

function DiscoveryContent() {
  const {
    athletes,
    pagination,
    isLoading,
    isError,
    activeFilterCount,
    refetch,
  } = useDiscovery();

  const [showAddToWatchlistModal, setShowAddToWatchlistModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<{
    id: number;
    name: string;
    watchlistIds: number[];
  } | null>(null);

  const handleAddToWatchlist = (athleteId: string) => {
    // Find the athlete by publicUuid
    const athlete = athletes.find((a) => a.publicUuid === athleteId);
    if (athlete) {
      setSelectedAthlete({
        id: athlete.id,
        name: `${athlete.firstName} ${athlete.lastName}`,
        watchlistIds: athlete.inWatchlistIds,
      });
      setShowAddToWatchlistModal(true);
    }
  };

  const handleWatchlistSuccess = () => {
    refetch(); // Refresh to update watchlist badges
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto bg-card border rounded-lg p-4">
            <DiscoveryFilters />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filter & Sort Controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <FilterDrawer activeFilterCount={activeFilterCount} />
            <SortDropdown className="w-[180px]" />
          </div>

          {/* Error State */}
          {isError && (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
              Failed to load athletes. Please try again.
            </div>
          )}

          {/* Results */}
          {!isError && (
            <DiscoveryResults
              athletes={athletes}
              pagination={pagination}
              isLoading={isLoading}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
        </main>
      </div>

      {/* Add to Watchlist Modal */}
      {selectedAthlete && (
        <AddToWatchlistModal
          open={showAddToWatchlistModal}
          onOpenChange={setShowAddToWatchlistModal}
          athleteId={selectedAthlete.id}
          athleteName={selectedAthlete.name}
          currentWatchlistIds={selectedAthlete.watchlistIds}
          onSuccess={handleWatchlistSuccess}
        />
      )}
    </>
  );
}

function DiscoveryLoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Skeleton className="h-9 w-24 lg:hidden" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
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
      </main>
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <SessionGuard>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Discover Athletes</h1>
          <p className="text-muted-foreground mt-1">
            Find and connect with athletes using filters
          </p>
        </div>

        {/* Main Layout with Suspense */}
        <Suspense fallback={<DiscoveryLoadingSkeleton />}>
          <DiscoveryContent />
        </Suspense>
      </div>
    </SessionGuard>
  );
}

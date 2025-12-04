"use client";

import { useState } from "react";
import { WatchlistCard } from "./WatchlistCard";
import { WatchlistForm } from "./WatchlistForm";
import { DeleteWatchlistDialog } from "./DeleteWatchlistDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";
import type {
  WatchlistSummary,
  CreateWatchlistInput,
} from "@/types/watchlists";

type WatchlistListProps = {
  watchlists: WatchlistSummary[];
  isLoading?: boolean;
  onUpdate?: (id: number, data: CreateWatchlistInput) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
};

/**
 * List of watchlist cards with edit/delete functionality.
 */
export function WatchlistList({
  watchlists,
  isLoading,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: WatchlistListProps) {
  const [editingWatchlist, setEditingWatchlist] =
    useState<WatchlistSummary | null>(null);
  const [deletingWatchlist, setDeletingWatchlist] =
    useState<WatchlistSummary | null>(null);

  const handleEdit = (watchlist: WatchlistSummary) => {
    setEditingWatchlist(watchlist);
  };

  const handleEditSubmit = async (data: CreateWatchlistInput) => {
    if (!editingWatchlist) return;
    await onUpdate?.(editingWatchlist.id, data);
    setEditingWatchlist(null);
  };

  const handleDelete = (watchlist: WatchlistSummary) => {
    setDeletingWatchlist(watchlist);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWatchlist) return;
    await onDelete?.(deletingWatchlist.id);
    setDeletingWatchlist(null);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (watchlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No watchlists yet</h3>
        <p className="text-muted-foreground mt-1 max-w-md">
          Create your first watchlist to start organizing athletes you want to
          follow.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {watchlists.map((watchlist) => (
          <WatchlistCard
            key={watchlist.id}
            watchlist={watchlist}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingWatchlist}
        onOpenChange={(open) => !open && setEditingWatchlist(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Watchlist</DialogTitle>
          </DialogHeader>
          {editingWatchlist && (
            <WatchlistForm
              initialData={{
                name: editingWatchlist.name,
                description: editingWatchlist.description,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingWatchlist(null)}
              isSubmitting={isUpdating}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteWatchlistDialog
        open={!!deletingWatchlist}
        onOpenChange={(open) => !open && setDeletingWatchlist(null)}
        watchlistName={deletingWatchlist?.name || ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

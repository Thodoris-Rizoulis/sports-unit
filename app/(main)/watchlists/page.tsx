"use client";

import { useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import { WatchlistList, WatchlistForm } from "@/components/watchlists";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWatchlists } from "@/hooks/useWatchlists";
import { useWatchlistMutations } from "@/hooks/useWatchlistMutations";
import { Plus } from "lucide-react";
import type { CreateWatchlistInput } from "@/types/watchlists";

export default function WatchlistsPage() {
  const { watchlists, isLoading, isError } = useWatchlists();
  const {
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    isCreating,
    isUpdating,
    isDeleting,
  } = useWatchlistMutations();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreate = async (data: CreateWatchlistInput) => {
    await createWatchlist(data);
    setShowCreateDialog(false);
  };

  const handleUpdate = async (id: number, data: CreateWatchlistInput) => {
    await updateWatchlist({ id, data });
  };

  const handleDelete = async (id: number) => {
    await deleteWatchlist(id);
  };

  return (
    <SessionGuard>
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Watchlists</h1>
            <p className="text-muted-foreground mt-1">
              Organize and track athletes you&apos;re interested in
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Watchlist</DialogTitle>
              </DialogHeader>
              <WatchlistForm
                onSubmit={handleCreate}
                onCancel={() => setShowCreateDialog(false)}
                isSubmitting={isCreating}
                submitLabel="Create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {isError && (
          <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive mb-6">
            Failed to load watchlists. Please try again.
          </div>
        )}

        {/* Watchlists */}
        {!isError && (
          <WatchlistList
            watchlists={watchlists}
            isLoading={isLoading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </SessionGuard>
  );
}

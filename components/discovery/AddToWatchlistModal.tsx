"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlists } from "@/hooks/useWatchlists";
import { useWatchlistMutations } from "@/hooks/useWatchlistMutations";
import { Plus, Loader2, ClipboardList } from "lucide-react";

type AddToWatchlistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteId: number;
  athleteName: string;
  currentWatchlistIds?: number[];
  onSuccess?: () => void;
};

/**
 * Modal for managing athlete watchlist membership.
 * Allows adding to new watchlists and removing from existing ones.
 * Includes inline watchlist creation capability.
 */
export function AddToWatchlistModal({
  open,
  onOpenChange,
  athleteId,
  athleteName,
  currentWatchlistIds = [],
  onSuccess,
}: AddToWatchlistModalProps) {
  const { watchlists, isLoading } = useWatchlists();
  const {
    createWatchlist,
    addAthleteToWatchlist,
    removeAthleteFromWatchlist,
    isCreating,
  } = useWatchlistMutations();

  // Track current checkbox state (checked = athlete should be in watchlist)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  // Track initial state (watchlists athlete is already in)
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
  // Inline create mode
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Initialize checked IDs from current watchlist IDs
  useEffect(() => {
    if (open) {
      const ids = new Set(currentWatchlistIds);
      setInitialIds(ids);
      setCheckedIds(new Set(currentWatchlistIds)); // Start with current state
      setShowCreateForm(false);
      setNewWatchlistName("");
    }
  }, [open, currentWatchlistIds]);

  const handleCheckboxChange = (watchlistId: number, checked: boolean) => {
    const newChecked = new Set(checkedIds);
    if (checked) {
      newChecked.add(watchlistId);
    } else {
      newChecked.delete(watchlistId);
    }
    setCheckedIds(newChecked);
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) return;

    try {
      const newWatchlist = await createWatchlist({
        name: newWatchlistName.trim(),
      });
      setNewWatchlistName("");
      setShowCreateForm(false);
      // Auto-select the new watchlist
      setCheckedIds(new Set([...checkedIds, newWatchlist.id]));
    } catch (error) {
      console.error("Failed to create watchlist:", error);
    }
  };

  const handleSave = async () => {
    // Calculate what changed
    const toAdd = Array.from(checkedIds).filter((id) => !initialIds.has(id));
    const toRemove = Array.from(initialIds).filter((id) => !checkedIds.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      // Add athlete to newly checked watchlists
      const addPromises = toAdd.map((watchlistId) =>
        addAthleteToWatchlist({ watchlistId, athleteId })
      );
      // Remove athlete from unchecked watchlists
      const removePromises = toRemove.map((watchlistId) =>
        removeAthleteFromWatchlist({ watchlistId, athleteId })
      );
      await Promise.all([...addPromises, ...removePromises]);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update watchlists:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are any changes
  const hasChanges =
    Array.from(checkedIds).some((id) => !initialIds.has(id)) ||
    Array.from(initialIds).some((id) => !checkedIds.has(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Watchlists</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select watchlists for {athleteName}
          </p>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : watchlists.length === 0 && !showCreateForm ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                You don&apos;t have any watchlists yet.
                <br />
                Create one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {watchlists.map((watchlist) => (
                <div key={watchlist.id} className="flex items-start gap-3">
                  <Checkbox
                    id={`watchlist-${watchlist.id}`}
                    checked={checkedIds.has(watchlist.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(watchlist.id, !!checked)
                    }
                    disabled={isSaving}
                  />
                  <Label
                    htmlFor={`watchlist-${watchlist.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-medium">{watchlist.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({watchlist.athleteCount} athletes)
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Inline Create Form */}
          {showCreateForm ? (
            <div className="mt-4 p-3 border rounded-md space-y-3">
              <Label htmlFor="newWatchlistName">New Watchlist Name</Label>
              <Input
                id="newWatchlistName"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter name..."
                disabled={isCreating}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateWatchlist}
                  disabled={!newWatchlistName.trim() || isCreating}
                >
                  {isCreating && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewWatchlistName("");
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Watchlist
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

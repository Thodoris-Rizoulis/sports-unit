import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  WatchlistSummary,
  CreateWatchlistInput,
  UpdateWatchlistInput,
} from "@/types/watchlists";

/**
 * Create a new watchlist
 */
async function createWatchlist(
  data: CreateWatchlistInput
): Promise<WatchlistSummary> {
  const res = await fetch("/api/watchlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create watchlist");
  }
  const result = await res.json();
  return result;
}

/**
 * Update an existing watchlist
 */
async function updateWatchlist({
  id,
  data,
}: {
  id: number;
  data: UpdateWatchlistInput;
}): Promise<WatchlistSummary> {
  const res = await fetch(`/api/watchlists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update watchlist");
  }
  const result = await res.json();
  return result;
}

/**
 * Delete a watchlist
 */
async function deleteWatchlist(id: number): Promise<void> {
  const res = await fetch(`/api/watchlists/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete watchlist");
  }
}

/**
 * Add an athlete to a watchlist
 */
async function addAthleteToWatchlist({
  watchlistId,
  athleteId,
}: {
  watchlistId: number;
  athleteId: number;
}): Promise<void> {
  const res = await fetch(`/api/watchlists/${watchlistId}/athletes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ athleteId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to add athlete to watchlist");
  }
}

/**
 * Remove an athlete from a watchlist
 */
async function removeAthleteFromWatchlist({
  watchlistId,
  athleteId,
}: {
  watchlistId: number;
  athleteId: number;
}): Promise<void> {
  const res = await fetch(
    `/api/watchlists/${watchlistId}/athletes/${athleteId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to remove athlete from watchlist");
  }
}

/**
 * Hook for watchlist mutations (create, update, delete, add/remove athletes)
 */
export function useWatchlistMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const addAthleteMutation = useMutation({
    mutationFn: addAthleteToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      queryClient.invalidateQueries({ queryKey: ["discovery"] });
    },
  });

  const removeAthleteMutation = useMutation({
    mutationFn: removeAthleteFromWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlists"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  return {
    createWatchlist: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateWatchlist: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteWatchlist: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    addAthleteToWatchlist: addAthleteMutation.mutateAsync,
    isAddingAthlete: addAthleteMutation.isPending,
    addAthleteError: addAthleteMutation.error,

    removeAthleteFromWatchlist: removeAthleteMutation.mutateAsync,
    isRemovingAthlete: removeAthleteMutation.isPending,
    removeAthleteError: removeAthleteMutation.error,
  };
}

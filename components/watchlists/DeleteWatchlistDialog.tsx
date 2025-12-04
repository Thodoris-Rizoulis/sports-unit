"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type DeleteWatchlistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchlistName: string;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
};

/**
 * Confirmation dialog for deleting a watchlist.
 */
export function DeleteWatchlistDialog({
  open,
  onOpenChange,
  watchlistName,
  onConfirm,
  isDeleting = false,
}: DeleteWatchlistDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Watchlist</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{watchlistName}&rdquo;? This
            will remove all athletes from this watchlist. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

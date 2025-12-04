"use client";

import { Suspense, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SessionGuard from "@/components/SessionGuard";
import {
  WatchlistDetail,
  WatchlistForm,
  DeleteWatchlistDialog,
} from "@/components/watchlists";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchlistMutations } from "@/hooks/useWatchlistMutations";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { CreateWatchlistInput } from "@/types/watchlists";

type WatchlistDetailPageProps = {
  params: Promise<{ id: string }>;
};

function WatchlistDetailContent({ watchlistId }: { watchlistId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { watchlist, athletes, pagination, isLoading, isError, refetch } =
    useWatchlist(watchlistId, page);

  const {
    updateWatchlist,
    deleteWatchlist,
    removeAthleteFromWatchlist,
    isUpdating,
    isDeleting,
    isRemovingAthlete,
  } = useWatchlistMutations();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [removingAthleteId, setRemovingAthleteId] = useState<number | null>(
    null
  );

  const handleUpdate = async (data: CreateWatchlistInput) => {
    await updateWatchlist({ id: watchlistId, data });
    setShowEditDialog(false);
  };

  const handleDelete = async () => {
    await deleteWatchlist(watchlistId);
    router.push("/watchlists");
  };

  const handleRemoveAthlete = async (athleteId: number) => {
    setRemovingAthleteId(athleteId);
    try {
      await removeAthleteFromWatchlist({
        watchlistId,
        athleteId,
      });
      refetch();
    } finally {
      setRemovingAthleteId(null);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-semibold">Watchlist not found</h3>
        <p className="text-muted-foreground mt-1">
          This watchlist may have been deleted or you don&apos;t have access.
        </p>
        <Button asChild className="mt-4">
          <Link href="/watchlists">Back to Watchlists</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !watchlist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
        </div>
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/watchlists">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Watchlist Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{watchlist.name}</h1>
        {watchlist.description && (
          <p className="text-muted-foreground mt-1">{watchlist.description}</p>
        )}
      </div>

      {/* Athletes */}
      <WatchlistDetail
        watchlist={watchlist}
        athletes={athletes}
        pagination={pagination}
        onRemoveAthlete={handleRemoveAthlete}
        isRemovingAthleteId={removingAthleteId}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Watchlist</DialogTitle>
          </DialogHeader>
          <WatchlistForm
            initialData={{
              name: watchlist.name,
              description: watchlist.description,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditDialog(false)}
            isSubmitting={isUpdating}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteWatchlistDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        watchlistName={watchlist.name}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

function WatchlistDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
    </div>
  );
}

export default function WatchlistDetailPage({
  params,
}: WatchlistDetailPageProps) {
  const resolvedParams = use(params);
  const watchlistId = parseInt(resolvedParams.id);

  if (isNaN(watchlistId)) {
    return (
      <SessionGuard>
        <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold">Invalid Watchlist</h3>
            <Button asChild className="mt-4">
              <Link href="/watchlists">Back to Watchlists</Link>
            </Button>
          </div>
        </div>
      </SessionGuard>
    );
  }

  return (
    <SessionGuard>
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Suspense fallback={<WatchlistDetailLoading />}>
          <WatchlistDetailContent watchlistId={watchlistId} />
        </Suspense>
      </div>
    </SessionGuard>
  );
}

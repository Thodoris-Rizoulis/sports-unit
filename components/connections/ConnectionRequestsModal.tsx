"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRespondToConnectionRequest } from "@/hooks/useConnectionStatus";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface ConnectionRequestsModalProps {
  open: boolean;
  onClose: () => void;
  connectionId: number;
  requesterName: string;
}

export function ConnectionRequestsModal({
  open,
  onClose,
  connectionId,
  requesterName,
}: ConnectionRequestsModalProps) {
  const [isResponding, setIsResponding] = useState(false);
  const respondMutation = useRespondToConnectionRequest();

  const handleRespond = async (action: "accept" | "decline") => {
    setIsResponding(true);
    try {
      await respondMutation.mutateAsync({ connectionId, action });
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {requesterName} wants to connect with you.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleRespond("decline")}
              disabled={isResponding}
              className="flex items-center gap-2"
            >
              {isResponding &&
              respondMutation.variables?.action === "decline" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Decline
            </Button>

            <Button
              onClick={() => handleRespond("accept")}
              disabled={isResponding}
              className="flex items-center gap-2"
            >
              {isResponding &&
              respondMutation.variables?.action === "accept" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

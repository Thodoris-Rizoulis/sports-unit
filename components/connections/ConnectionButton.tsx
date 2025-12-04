import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useConnectionStatus,
  useSendConnectionRequest,
  useCancelConnectionRequest,
} from "@/hooks/useConnectionStatus";
import { ConnectionRequestsModal } from "./ConnectionRequestsModal";
import { Loader2, UserPlus, UserCheck, Clock, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ConnectionButtonProps {
  targetUserId: number;
  className?: string;
}

export function ConnectionButton({
  targetUserId,
  className,
}: ConnectionButtonProps) {
  const { data: status, isLoading, error } = useConnectionStatus(targetUserId);
  const sendRequestMutation = useSendConnectionRequest();
  const cancelRequestMutation = useCancelConnectionRequest();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canSelect, setCanSelect] = useState(false);

  // When menu opens, wait a bit before allowing selections
  useEffect(() => {
    if (menuOpen) {
      setCanSelect(false);
      const timer = setTimeout(() => {
        setCanSelect(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setCanSelect(false);
    }
  }, [menuOpen]);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        Error
      </Button>
    );
  }

  const handleConnect = () => {
    sendRequestMutation.mutate(targetUserId);
  };

  const handleCancelRequest = () => {
    if (status?.connectionId) {
      cancelRequestMutation.mutate(status.connectionId);
      setMenuOpen(false);
    }
  };

  const handleSelect = (callback: () => void) => (e: Event) => {
    e.preventDefault();
    if (!canSelect) {
      return;
    }
    setMenuOpen(false);
    requestAnimationFrame(() => {
      callback();
    });
  };

  switch (status?.status) {
    case "none":
      return (
        <Button
          variant="default"
          size="sm"
          onClick={handleConnect}
          disabled={sendRequestMutation.isPending}
          className={className}
        >
          {sendRequestMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          Connect
        </Button>
      );

    case "pending_sent":
      return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className={className}
              disabled={cancelRequestMutation.isPending}
            >
              {cancelRequestMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Request Sent
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={handleSelect(handleCancelRequest)}
              className="text-destructive focus:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Request
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "pending_received":
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModal(true)}
            className={className}
          >
            Respond
          </Button>
          {status.requester && (
            <ConnectionRequestsModal
              open={showModal}
              onClose={() => setShowModal(false)}
              connectionId={status.connectionId!}
              requesterName={status.requester.username}
            />
          )}
        </>
      );

    case "connected":
      return (
        <Button variant="outline" size="sm" className={className}>
          <UserCheck className="h-4 w-4 mr-2" />
          Connected
        </Button>
      );

    default:
      return (
        <Button variant="outline" size="sm" disabled className={className}>
          Error
        </Button>
      );
  }
}

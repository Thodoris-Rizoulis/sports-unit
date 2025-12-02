import { Button } from "@/components/ui/button";
import {
  useConnectionStatus,
  useSendConnectionRequest,
} from "@/hooks/useConnectionStatus";
import { ConnectionRequestsModal } from "./ConnectionRequestsModal";
import { Loader2, UserPlus, UserCheck, UserX } from "lucide-react";
import { useState } from "react";

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
  const [showModal, setShowModal] = useState(false);

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
        <Button variant="secondary" size="sm" disabled className={className}>
          <UserCheck className="h-4 w-4 mr-2" />
          Request Sent
        </Button>
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

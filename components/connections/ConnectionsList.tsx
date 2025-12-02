"use client";

import { useState } from "react";
import { useConnections, useRemoveConnection } from "@/hooks/useConnections";
import { useRespondToConnectionRequest } from "@/hooks/useConnectionStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  UserMinus,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getProfileUrl } from "@/lib/utils";

interface ConnectionsListProps {
  status?: "accepted" | "pending" | "pending_received";
  title: string;
  emptyMessage: string;
  showPagination?: boolean;
}

export function ConnectionsList({
  status,
  title,
  emptyMessage,
  showPagination = false,
}: ConnectionsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading, error } = useConnections(
    status,
    showPagination ? currentPage : 1,
    showPagination ? itemsPerPage : 1000 // Large limit when no pagination
  );

  const connections = data?.connections || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const removeMutation = useRemoveConnection();
  const respondMutation = useRespondToConnectionRequest();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error loading connections
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/default_profile.jpg" />
                  <AvatarFallback>
                    {connection.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <Link
                    href={getProfileUrl({
                      publicUuid: connection.user.publicUuid,
                      username: connection.user.username,
                    })}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    @{connection.user.username}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {connection.status === "accepted" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <UserCheck className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {connection.status === "pending_received" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Request Received
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {connection.status === "accepted" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMutation.mutate(connection.id)}
                  disabled={removeMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {removeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  Remove
                </Button>
              )}

              {connection.status === "pending_received" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({
                        connectionId: connection.id,
                        action: "decline",
                      })
                    }
                    disabled={respondMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {respondMutation.isPending &&
                    respondMutation.variables?.action === "decline" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({
                        connectionId: connection.id,
                        action: "accept",
                      })
                    }
                    disabled={respondMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {respondMutation.isPending &&
                    respondMutation.variables?.action === "accept" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Accept
                  </Button>
                </div>
              )}
            </div>
          ))}

          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {connections.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to {Math.min(currentPage * itemsPerPage, total)} of {total}{" "}
                connections
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

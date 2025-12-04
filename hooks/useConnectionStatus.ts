import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionStatusResponse } from "@/types/prisma";

export const connectionStatusKey = (userId: number, targetUserId: number) => [
  "connection-status",
  userId,
  targetUserId,
];

export function useConnectionStatus(targetUserId: number) {
  return useQuery({
    queryKey: connectionStatusKey(0, targetUserId), // userId will be set in queryFn
    queryFn: async (): Promise<ConnectionStatusResponse> => {
      const res = await fetch(`/api/connections/status/${targetUserId}`);
      if (!res.ok) throw new Error("Failed to fetch connection status");
      return res.json();
    },
    enabled: !!targetUserId,
  });
}

export function useSendConnectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: number) => {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: targetUserId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send request");
      }
      return res.json();
    },
    onSuccess: (_, targetUserId) => {
      // Invalidate connection status for this user
      qc.invalidateQueries({ queryKey: ["connection-status"] });
    },
  });
}

export function useRespondToConnectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      connectionId,
      action,
    }: {
      connectionId: number;
      action: "accept" | "decline";
    }) => {
      const res = await fetch(`/api/connections/${connectionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to respond to request");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all connection-related queries
      qc.invalidateQueries({ queryKey: ["connection-status"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useRemoveConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: number) => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to remove connection");
      }
    },
    onSuccess: () => {
      // Invalidate all connection-related queries
      qc.invalidateQueries({ queryKey: ["connection-status"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useCancelConnectionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: number) => {
      const res = await fetch(`/api/connections/${connectionId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to cancel connection request");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all connection-related queries
      qc.invalidateQueries({ queryKey: ["connection-status"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConnectionListItem } from "@/types/prisma";

export const connectionsKey = (
  userId?: number,
  status?: string,
  page?: number,
  limit?: number
) => ["connections", userId, status, page, limit];

export function useConnections(
  status?: "accepted" | "pending" | "pending_received",
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: connectionsKey(0, status, page, limit), // userId will be set in queryFn
    queryFn: async (): Promise<{
      connections: ConnectionListItem[];
      total: number;
    }> => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/connections?${params}`);
      if (!res.ok) throw new Error("Failed to fetch connections");
      return res.json();
    },
    enabled: true,
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
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all connection-related queries
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["connection-status"] });
    },
  });
}

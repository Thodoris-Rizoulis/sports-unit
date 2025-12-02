import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AwardUI } from "@/types/prisma";
import type { AwardInput } from "@/types/enhanced-profile";

export const awardsKey = (uuid: string) => ["awards", uuid];

/**
 * Hook to fetch all award entries for a user
 */
export function useAwards(uuid: string | undefined) {
  return useQuery({
    queryKey: awardsKey(uuid!),
    queryFn: async (): Promise<AwardUI[]> => {
      const res = await fetch(`/api/profile/${encodeURIComponent(uuid!)}/awards`);
      if (!res.ok) throw new Error("Failed to fetch awards");
      const data = await res.json();
      return data.awards;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to create a new award entry
 */
export function useCreateAward(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AwardInput): Promise<AwardUI> => {
      const res = await fetch(`/api/profile/${encodeURIComponent(uuid)}/awards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create award");
      }
      const result = await res.json();
      return result.award;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: awardsKey(uuid) });
    },
  });
}

/**
 * Hook to update an award entry
 */
export function useUpdateAward(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<AwardInput>;
    }): Promise<AwardUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/awards/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update award");
      }
      const result = await res.json();
      return result.award;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: awardsKey(uuid) });
    },
  });
}

/**
 * Hook to delete an award entry
 */
export function useDeleteAward(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/awards/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete award");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: awardsKey(uuid) });
    },
  });
}

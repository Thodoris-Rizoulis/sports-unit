import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { KeyInfoFormInput } from "@/types/enhanced-profile";

export type KeyInfoData = {
  dateOfBirth: Date | null;
  height: number | null;
  positions: number[] | null;
  strongFoot: string | null;
};

export const keyInfoKey = (uuid: string) => ["keyInfo", uuid];

/**
 * Hook to fetch key information for a user profile
 */
export function useKeyInfo(uuid: string | undefined) {
  return useQuery({
    queryKey: keyInfoKey(uuid!),
    queryFn: async (): Promise<KeyInfoData | null> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/key-info`
      );
      if (!res.ok) throw new Error("Failed to fetch key info");
      const data = await res.json();
      return data.keyInfo;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to update key information
 */
export function useUpdateKeyInfo(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: KeyInfoFormInput): Promise<KeyInfoData> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/key-info`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update key info");
      }
      const result = await res.json();
      return result.keyInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyInfoKey(uuid) });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AthleteMetricsUI } from "@/types/prisma";
import type { AthleteMetricsInput } from "@/types/enhanced-profile";

export const athleteMetricsKey = (uuid: string) => ["athleteMetrics", uuid];

/**
 * Hook to fetch athlete metrics for a user
 */
export function useAthleteMetrics(uuid: string | undefined) {
  return useQuery({
    queryKey: athleteMetricsKey(uuid!),
    queryFn: async (): Promise<AthleteMetricsUI | null> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/metrics`
      );
      if (!res.ok) throw new Error("Failed to fetch athlete metrics");
      const data = await res.json();
      return data.metrics;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to update athlete metrics
 */
export function useUpdateAthleteMetrics(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: AthleteMetricsInput
    ): Promise<AthleteMetricsUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/metrics`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update athlete metrics");
      }
      const result = await res.json();
      return result.metrics;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteMetricsKey(uuid) });
    },
  });
}

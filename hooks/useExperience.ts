import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExperienceUI } from "@/types/prisma";
import type { ExperienceInput } from "@/types/enhanced-profile";

export const experienceKey = (uuid: string) => ["experience", uuid];

/**
 * Hook to fetch all experience entries for a user
 */
export function useExperience(uuid: string | undefined) {
  return useQuery({
    queryKey: experienceKey(uuid!),
    queryFn: async (): Promise<ExperienceUI[]> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/experience`
      );
      if (!res.ok) throw new Error("Failed to fetch experience");
      const data = await res.json();
      return data.experiences;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to create a new experience entry
 */
export function useCreateExperience(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExperienceInput): Promise<ExperienceUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/experience`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create experience");
      }
      const result = await res.json();
      return result.experience;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKey(uuid) });
    },
  });
}

/**
 * Hook to update an experience entry
 */
export function useUpdateExperience(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ExperienceInput>;
    }): Promise<ExperienceUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/experience/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update experience");
      }
      const result = await res.json();
      return result.experience;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKey(uuid) });
    },
  });
}

/**
 * Hook to delete an experience entry
 */
export function useDeleteExperience(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/experience/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete experience");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKey(uuid) });
    },
  });
}

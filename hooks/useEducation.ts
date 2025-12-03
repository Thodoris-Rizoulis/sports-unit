import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EducationUI } from "@/types/prisma";
import type { EducationInput } from "@/types/enhanced-profile";

export const educationKey = (uuid: string) => ["education", uuid];

/**
 * Hook to fetch all education entries for a user
 */
export function useEducation(uuid: string | undefined) {
  return useQuery({
    queryKey: educationKey(uuid!),
    queryFn: async (): Promise<EducationUI[]> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/education`
      );
      if (!res.ok) throw new Error("Failed to fetch education");
      const data = await res.json();
      return data.education;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to create a new education entry
 */
export function useCreateEducation(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EducationInput): Promise<EducationUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/education`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create education");
      }
      const result = await res.json();
      return result.education;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKey(uuid) });
    },
  });
}

/**
 * Hook to update an education entry
 */
export function useUpdateEducation(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<EducationInput>;
    }): Promise<EducationUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/education/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update education");
      }
      const result = await res.json();
      return result.education;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKey(uuid) });
    },
  });
}

/**
 * Hook to delete an education entry
 */
export function useDeleteEducation(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/education/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete education");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationKey(uuid) });
    },
  });
}

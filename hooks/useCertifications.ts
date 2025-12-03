import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CertificationUI } from "@/types/prisma";
import type { CertificationInput } from "@/types/enhanced-profile";

export const certificationsKey = (uuid: string) => ["certifications", uuid];

/**
 * Hook to fetch all certification entries for a user
 */
export function useCertifications(uuid: string | undefined) {
  return useQuery({
    queryKey: certificationsKey(uuid!),
    queryFn: async (): Promise<CertificationUI[]> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/certifications`
      );
      if (!res.ok) throw new Error("Failed to fetch certifications");
      const data = await res.json();
      return data.certifications;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to create a new certification entry
 */
export function useCreateCertification(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CertificationInput): Promise<CertificationUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/certifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create certification");
      }
      const result = await res.json();
      return result.certification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsKey(uuid) });
    },
  });
}

/**
 * Hook to update a certification entry
 */
export function useUpdateCertification(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CertificationInput>;
    }): Promise<CertificationUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/certifications/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update certification");
      }
      const result = await res.json();
      return result.certification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsKey(uuid) });
    },
  });
}

/**
 * Hook to delete a certification entry
 */
export function useDeleteCertification(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/certifications/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete certification");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationsKey(uuid) });
    },
  });
}

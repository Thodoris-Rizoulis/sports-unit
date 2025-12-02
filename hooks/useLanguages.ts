import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LanguageUI } from "@/types/prisma";
import type { LanguageInput } from "@/types/enhanced-profile";

export const languagesKey = (uuid: string) => ["languages", uuid];

/**
 * Hook to fetch all language entries for a user
 */
export function useLanguages(uuid: string | undefined) {
  return useQuery({
    queryKey: languagesKey(uuid!),
    queryFn: async (): Promise<LanguageUI[]> => {
      const res = await fetch(`/api/profile/${encodeURIComponent(uuid!)}/languages`);
      if (!res.ok) throw new Error("Failed to fetch languages");
      const data = await res.json();
      return data.languages;
    },
    enabled: !!uuid,
  });
}

/**
 * Hook to create a new language entry
 */
export function useCreateLanguage(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LanguageInput): Promise<LanguageUI> => {
      const res = await fetch(`/api/profile/${encodeURIComponent(uuid)}/languages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create language");
      }
      const result = await res.json();
      return result.language;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languagesKey(uuid) });
    },
  });
}

/**
 * Hook to update a language entry
 */
export function useUpdateLanguage(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<LanguageInput>;
    }): Promise<LanguageUI> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/languages/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update language");
      }
      const result = await res.json();
      return result.language;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languagesKey(uuid) });
    },
  });
}

/**
 * Hook to delete a language entry
 */
export function useDeleteLanguage(uuid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid)}/languages/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete language");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languagesKey(uuid) });
    },
  });
}

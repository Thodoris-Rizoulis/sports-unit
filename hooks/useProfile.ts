import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const profileKey = (id?: string) => ["profile", id ?? "me"];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useProfile(id?: string) {
  return useQuery({
    queryKey: profileKey(id),
    queryFn: async () => {
      // If no id provided, return current user's profile
      if (!id) {
        const res = await fetch(`/api/profile`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      }

      // Expect `id` to be a `publicUuid` (canonical identifier). Always call the by-uuid endpoint.
      const res = await fetch(`/api/profile/by-uuid/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, any>) => {
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onMutate: async (patch: Record<string, any>) => {
      // Cancel any outgoing refetches and snapshot previous data for rollback
      await qc.cancelQueries({ queryKey: ["profile"], exact: false });

      // Save previous data for all profile-related queries
      const previous = qc.getQueriesData({
        queryKey: ["profile"],
        exact: false,
      });

      // Optimistically update all profile queries so UI reflects changes immediately
      try {
        const queries = qc.getQueryCache().getAll();
        queries.forEach((q) => {
          const key = q.queryKey;
          if (Array.isArray(key) && key[0] === "profile") {
            qc.setQueryData(key, (old: any) => ({ ...old, ...patch }));
          }
        });
      } catch (e) {
        // ignore errors during optimistic set
      }

      return { previous };
    },
    onError: (err, patch, context: any) => {
      // Roll back all profile-related queries
      try {
        if (context?.previous && Array.isArray(context.previous)) {
          context.previous.forEach(([key, data]: any) => {
            qc.setQueryData(key, data);
          });
        }
      } catch (e) {
        // ignore
      }
    },
    onSettled: () => {
      // Invalidate all profile queries (both 'me' and username variants)
      qc.invalidateQueries({ queryKey: ["profile"], exact: false });
    },
  });
}

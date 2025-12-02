import { useQuery } from "@tanstack/react-query";

export const teamsKey = (sportId?: number | null) => [
  "teams",
  sportId ?? "all",
];

export function useTeams(sportId?: number | null) {
  return useQuery({
    queryKey: teamsKey(sportId),
    queryFn: async () => {
      const url = sportId ? `/api/teams?sportId=${sportId}` : `/api/teams`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
  });
}

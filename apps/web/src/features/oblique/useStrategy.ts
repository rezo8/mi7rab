import { useQuery } from "@tanstack/react-query";
import type { Strategy } from "@mihrab/shared";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/** The current drawn card. "Draw another" is an explicit refetch (see ObliqueScreen). */
export function useStrategy() {
  return useQuery({
    queryKey: ["strategy", "random"],
    queryFn: ({ signal }) => api.get<Strategy>(endpoints.strategiesRandom, { signal }),
  });
}

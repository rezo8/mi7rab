import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { UserProfile } from "@mihrab/shared";

export const PROFILE_QUERY_KEY = ["profile"] as const;

function isSameLocalDay(isoTimestamp: string): boolean {
  return new Date(isoTimestamp).toLocaleDateString() === new Date().toLocaleDateString();
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => api.get<UserProfile>("/api/profile"),
    staleTime: Infinity,
    retry: false,
  });

  const writtenToday = data?.lastPageAt != null && isSameLocalDay(data.lastPageAt);

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

  return { profile: data, writtenToday, isPending, isError, invalidate };
}

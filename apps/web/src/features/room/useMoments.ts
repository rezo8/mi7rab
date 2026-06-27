import { useQuery } from "@tanstack/react-query";
import type { MomentSummary } from "@mihrab/shared";
import { api } from "@/lib/api/client";

const MIN_CARDS = 52;

function padMoments(moments: MomentSummary[]): MomentSummary[] {
  if (moments.length === 0 || moments.length >= MIN_CARDS) return moments;
  const result = [...moments];
  while (result.length < MIN_CARDS) {
    result.push(moments[Math.floor(Math.random() * moments.length)]!);
  }
  return result;
}

export function useMoments(doorId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["moments", doorId],
    queryFn: async () => {
      const raw = await api.get<MomentSummary[]>(
        `/api/moments?door=${encodeURIComponent(doorId)}`,
      );
      return padMoments(raw);
    },
    staleTime: Infinity,
  });
  return { moments: data ?? [], isLoading, isError };
}

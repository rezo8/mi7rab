import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const STALE_MS = 50 * 60 * 1000; // 50 min — GCS signed URLs last 1 hr

export function useMomentImageUrl(fileKey: string | null | undefined) {
  const parts = fileKey?.split("/");
  const door = parts?.[0];
  const filename = parts?.[1];

  return useQuery({
    queryKey: ["signed-url", fileKey],
    queryFn: async () => {
      const { url } = await api.get<{ url: string; expiresIn: number }>(
        `/api/storage/${door}/${filename}/url`,
      );
      return url as string;
    },
    enabled: !!door && !!filename,
    staleTime: STALE_MS,
    gcTime: STALE_MS + 5 * 60 * 1000,
  });
}

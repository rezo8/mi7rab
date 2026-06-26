export const endpoints = {
  strategiesRandom: "/api/strategies/random",
  profile: "/api/profile",
  pages: "/api/pages",
} as const;

export const pageUrl = (id: string) => `/api/pages/${id}` as const;

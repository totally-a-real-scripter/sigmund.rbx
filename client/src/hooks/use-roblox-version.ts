import { useQuery } from "@tanstack/react-query";

export interface RobloxLatestInfo {
  platform: string;
  channel: string;
  version: string;
  packageUrl: string;
  lastChecked: string;
  source: string;
}

async function fetchRobloxLatestInfo(forceRefresh = false): Promise<RobloxLatestInfo> {
  const url = forceRefresh ? "/api/roblox/latest?refresh=true" : "/api/roblox/latest";
  const response = await fetch(url, { credentials: "include" });

  if (!response.ok) {
    throw new Error("Unable to fetch latest build info.");
  }

  return response.json() as Promise<RobloxLatestInfo>;
}

export function useRobloxVersion() {
  return useQuery({
    queryKey: ["roblox-latest"],
    queryFn: () => fetchRobloxLatestInfo(false),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 1,
  });
}

export { fetchRobloxLatestInfo };

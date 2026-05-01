import { useQuery } from "@tanstack/react-query";

interface RobloxVersionResponse {
  clientVersionUpload: string;
}

async function fetchRobloxVersion(): Promise<string> {
  const response = await fetch("/api/roblox-version", { credentials: "include" });

  if (!response.ok) {
    throw new Error("Unable to fetch latest build version.");
  }

  const data: RobloxVersionResponse = await response.json();
  return data.clientVersionUpload;
}

export function useRobloxVersion() {
  return useQuery({
    queryKey: ["roblox-version"],
    queryFn: fetchRobloxVersion,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
  });
}

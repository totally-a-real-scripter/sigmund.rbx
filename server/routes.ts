import type { Express } from "express";
import { createServer, type Server } from "http";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
  }
}

const sitePassword = process.env.SITE_PASSWORD || "change-me";
const ROBLOX_CLIENT_SETTINGS_URL = "https://clientsettingscdn.roblox.com/v2/client-version/MacPlayer";
const ROBLOX_CHANNEL = "LIVE";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface RobloxLatestResponse {
  platform: "macOS";
  channel: string;
  version: string;
  packageUrl: string;
  lastChecked: string;
  source: string;
}

let latestCache: { data: RobloxLatestResponse; cachedAt: number } | null = null;

async function fetchLatestRobloxBuild(forceRefresh = false): Promise<RobloxLatestResponse> {
  const now = Date.now();
  if (!forceRefresh && latestCache && now - latestCache.cachedAt < CACHE_TTL_MS) {
    return latestCache.data;
  }

  const endpoint = `${ROBLOX_CLIENT_SETTINGS_URL}?binaryType=MacPlayer&channel=${ROBLOX_CHANNEL}`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "sigmund-rbx/1.0",
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Roblox version lookup failed with status ${response.status}`);
  }

  const payload = await response.json() as { clientVersionUpload?: string; version?: string; channelName?: string };
  const version = payload.clientVersionUpload || payload.version;

  if (!version) {
    throw new Error("Roblox version lookup did not include a version string");
  }

  const data: RobloxLatestResponse = {
    platform: "macOS",
    channel: payload.channelName || ROBLOX_CHANNEL,
    version,
    packageUrl: `https://setup.rbxcdn.com/mac/${version}-RobloxPlayer.zip`,
    lastChecked: new Date().toISOString(),
    source: ROBLOX_CLIENT_SETTINGS_URL,
  };

  latestCache = { data, cachedAt: now };
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth", (req, res) => {
    const { password } = req.body as { password?: string };

    if (!password || password !== sitePassword) {
      req.session.isAuthenticated = false;
      return res.status(401).json({ success: false, message: "Invalid password." });
    }

    req.session.isAuthenticated = true;
    return res.json({ success: true });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ authenticated: req.session.isAuthenticated === true });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("sigmund_sid");
      res.json({ success: true });
    });
  });

  app.get("/api/roblox/latest", async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === "true";
      const latest = await fetchLatestRobloxBuild(forceRefresh);
      res.json(latest);
    } catch (error) {
      console.error("Error fetching Roblox latest build:", error);
      res.status(502).json({ error: "Failed to fetch latest Roblox macOS build." });
    }
  });

  app.get("/api/roblox/download", async (_req, res) => {
    try {
      const latest = await fetchLatestRobloxBuild(false);
      res.redirect(302, latest.packageUrl);
    } catch (error) {
      console.error("Error resolving Roblox download URL:", error);
      res.status(502).json({ error: "Unable to resolve Roblox download URL right now." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

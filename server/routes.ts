import type { Express } from "express";
import { createServer, type Server } from "http";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
  }
}

const sitePassword = process.env.SITE_PASSWORD || "letmein";

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

  app.get("/api/roblox-version", async (_req, res) => {
    try {
      const response = await fetch("https://clientsettingscdn.roblox.com/v2/client-version/MacPlayer");

      if (!response.ok) {
        throw new Error(`Roblox API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Roblox version:", error);
      res.status(500).json({
        error: "Failed to fetch Roblox version",
        fallback: { clientVersionUpload: "version-6ced3f7b78bf439c" },
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

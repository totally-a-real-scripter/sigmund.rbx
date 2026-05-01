import express from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find built client files at ${distPath}`);
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

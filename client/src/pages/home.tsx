import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchRobloxLatestInfo, useRobloxVersion } from "@/hooks/use-roblox-version";

function ProductNav() {
  return (
    <header className="top-nav glass">
      <p className="brand">sigmund.rbx</p>
      <nav className="nav-actions" aria-label="Primary">
        <a href="#downloader">Downloader</a>
        <a href="#features">Features</a>
      </nav>
    </header>
  );
}

function PasswordPage({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Incorrect password. Please check and try again.");
        return;
      }
      onSuccess();
    } catch {
      setError("Authentication is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-shell page-fade">
      <div className="app-layout auth-layout">
        <ProductNav />
        <section className="hero-frame glass">
          <p className="eyebrow">RBX Downloader</p>
          <h1>Private Roblox macOS launcher page</h1>
          <p className="supporting-text">Secure access for trusted users.</p>
        </section>
        <section className="auth-panel glass" aria-labelledby="auth-title">
          <h2 id="auth-title">Sign in to continue</h2>
          <p className="supporting-text">Enter your site password to access the page.</p>
          <form onSubmit={onSubmit} className="stack-sm" noValidate>
            <label htmlFor="site-password" className="field-label">Site password</label>
            <Input id="site-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            {error ? <p className="inline-error" role="alert">{error}</p> : null}
            <Button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Verifying access..." : "Continue to downloader"}</Button>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoadingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = ["Verifying credentials", "Preparing launcher view", "Syncing latest build metadata"];
  useEffect(() => {
    const interval = window.setInterval(() => setStepIndex((prev) => (prev + 1) % steps.length), 900);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="app-shell page-fade">
      <section className="loading-panel glass" aria-live="polite" role="status">
        <div className="spinner" aria-hidden="true" />
        <h2>Loading downloader</h2>
        <p className="supporting-text">{steps[stepIndex]}</p>
      </section>
    </main>
  );
}

function DownloaderPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useRobloxVersion();
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusText, setStatusText] = useState("Checking current Roblox release");

  useEffect(() => {
    if (isLoading || isRefetching) setStatusText("Checking current Roblox release");
    else if (isError) setStatusText("Unable to fetch the latest build right now");
    else if (data) setStatusText("Build info updated");
  }, [isLoading, isRefetching, isError, data]);

  const refreshBuildInfo = async () => {
    setStatusText("Checking current Roblox release");
    try {
      await fetchRobloxLatestInfo(true);
      await refetch();
      setStatusText("Build info updated");
    } catch {
      setStatusText("Unable to fetch the latest build right now");
    }
  };

  const handleDownload = () => {
    setStatusText("Starting download");
    setIsDownloading(true);
    window.location.assign("/api/roblox/download");
    window.setTimeout(() => setIsDownloading(false), 1200);
  };

  return (
    <main className="app-shell page-fade">
      <div className="app-layout">
        <ProductNav />
        <section className="hero-frame glass">
          <p className="eyebrow">Roblox for macOS</p>
          <h1>Download the latest Roblox Mac build</h1>
          <p className="supporting-text">Live build lookup, short caching, and direct official download flow.</p>
          <div className="hero-actions">
            <Button onClick={handleDownload} disabled={!data || isDownloading || isLoading || isError} className="btn-primary">{isDownloading ? "Starting download..." : "Download for macOS"}</Button>
            <Button variant="outline" onClick={refreshBuildInfo} disabled={isRefetching} className="btn-secondary">Refresh build info</Button>
          </div>
        </section>

        <Card className="status-frame glass" id="downloader">
          <CardHeader className="pb-3"><CardTitle className="text-[1.4rem] font-bold text-[hsl(220_26%_98%)]">Latest macOS build</CardTitle></CardHeader>
          <CardContent className="stack-md">
            <div className="badge-row">
              <span className="glass-badge">Platform: {data?.platform ?? "macOS"}</span>
              <span className="glass-badge">Channel: {data?.channel ?? "Unavailable"}</span>
            </div>
            <div className="meta-grid">
              <div><p className="meta-label">Version</p><p className="meta-value">{data?.version ?? "Unavailable"}</p></div>
              <div><p className="meta-label">Last checked</p><p className="meta-value muted">{data?.lastChecked ? new Date(data.lastChecked).toLocaleString() : "Not yet checked"}</p></div>
            </div>
            <p className="meta-value muted">{statusText}</p>
          </CardContent>
        </Card>

        <section className="feature-grid" id="features">
          <article className="feature-card glass"><h3>Live metadata</h3><p>Retrieves latest official Roblox macOS version details from Roblox client settings.</p></article>
          <article className="feature-card glass"><h3>Cached responsibly</h3><p>Server caches metadata for 10 minutes to reduce upstream requests.</p></article>
          <article className="feature-card glass"><h3>Integrated flow</h3><p>The app resolves the package URL server-side, then starts download from a clean endpoint.</p></article>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"checking" | "password" | "loading" | "downloader">("checking");
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status", { credentials: "include" });
        const data = await response.json();
        setScreen(data.authenticated ? "downloader" : "password");
      } catch { setScreen("password"); }
    };
    checkAuth();
  }, []);
  const proceedToLoading = () => { setScreen("loading"); window.setTimeout(() => setScreen("downloader"), 2200); };
  if (screen === "checking" || screen === "loading") return <LoadingPage />;
  if (screen === "password") return <PasswordPage onSuccess={proceedToLoading} />;
  return <DownloaderPage />;
}

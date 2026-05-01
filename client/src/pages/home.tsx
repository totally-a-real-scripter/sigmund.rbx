import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRobloxVersion } from "@/hooks/use-roblox-version";

const PLATFORM_LABEL = "macOS";

function ProductNav() {
  return (
    <header className="top-nav glass">
      <p className="brand">Sigmund RBX</p>
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
          <p className="eyebrow">Roblox macOS launcher</p>
          <h1>Fast, clean Mac download access</h1>
          <p className="supporting-text">Secure entry keeps the downloader private while maintaining a polished product-style interface.</p>
        </section>
        <section className="auth-panel glass" aria-labelledby="auth-title">
          <h2 id="auth-title">Sign in to continue</h2>
          <p className="supporting-text">Enter your site password to access the latest macOS package.</p>
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
  const { data: version, isLoading, isError, refetch, isRefetching } = useRobloxVersion();
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const releaseLabel = useMemo(() => version || "Unavailable", [version]);

  const handleDownload = () => {
    if (!version || isDownloading) return;
    setStatus(null);
    setIsDownloading(true);
    try {
      const downloadUrl = `https://setup.rbxcdn.com/mac/${version}-RobloxPlayer.zip`;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => setStatus({ tone: "success", message: "Download started. Open the ZIP and run RobloxPlayerInstaller." }), 950);
    } catch {
      setStatus({ tone: "error", message: "Could not start download. Please try again." });
    } finally {
      window.setTimeout(() => setIsDownloading(false), 1900);
    }
  };

  return (
    <main className="app-shell page-fade">
      <div className="app-layout">
        <ProductNav />
        <section className="hero-frame glass">
          <p className="eyebrow">Roblox for macOS</p>
          <h1>Download the latest Roblox Mac build</h1>
          <p className="supporting-text">A premium-style launcher page with direct access to the latest public player package.</p>
          <div className="hero-actions">
            <Button onClick={handleDownload} disabled={!version || isDownloading} className="btn-primary">{isDownloading ? "Starting download..." : "Download for macOS"}</Button>
            <Button variant="outline" onClick={() => refetch()} className="btn-secondary">Refresh build info</Button>
          </div>
        </section>

        <Card className="status-frame glass" id="downloader">
          <CardHeader className="pb-3">
            <CardTitle className="text-[1.4rem] font-bold text-[hsl(220_26%_98%)]">Download Status</CardTitle>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="badge-row">
              <span className="glass-badge">Platform: {PLATFORM_LABEL}</span>
              <span className="glass-badge">Channel: Public Release</span>
            </div>
            <div className="meta-grid">
              <div><p className="meta-label">Latest build</p>{isLoading || isRefetching ? <p className="meta-value muted">Checking build data...</p> : isError ? <p className="meta-value error">Build data unavailable</p> : <p className="meta-value">{releaseLabel}</p>}</div>
              <div><p className="meta-label">Install flow</p><p className="meta-value muted">Download ZIP, open installer, launch Roblox.</p></div>
            </div>
            {isError ? <Button variant="outline" className="btn-secondary" onClick={() => refetch()}>Retry build lookup</Button> : null}
            {status ? <p className={`notice ${status.tone}`}>{status.message}</p> : <p className="meta-value muted">Status updates appear here after actions.</p>}
          </CardContent>
        </Card>

        <section className="feature-grid" id="features">
          <article className="feature-card glass"><h3>Latest macOS build</h3><p>Fetches current version metadata and keeps the version panel easy to verify.</p></article>
          <article className="feature-card glass"><h3>Direct download</h3><p>One click starts the official package download in a new tab with clean feedback.</p></article>
          <article className="feature-card glass"><h3>Simple install flow</h3><p>Clear instructions help you move from ZIP to installed player quickly.</p></article>
          <article className="feature-card glass"><h3>Troubleshooting</h3><p>Retry controls and status messages keep issues readable and recoverable.</p></article>
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

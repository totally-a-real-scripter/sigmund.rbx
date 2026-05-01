import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRobloxVersion } from "@/hooks/use-roblox-version";

const PLATFORM_LABEL = "macOS";

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
        setError("Incorrect password. Please try again.");
        return;
      }

      onSuccess();
    } catch {
      setError("Authentication service is unavailable. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="screen-wrap">
      <section className="auth-panel page-fade" aria-labelledby="auth-title">
        <p className="eyebrow">Secure access</p>
        <h1 id="auth-title">Enter site password</h1>
        <p className="supporting-text">Access is restricted. Enter your password to continue to the downloader.</p>
        <form onSubmit={onSubmit} className="stack-sm" noValidate>
          <label htmlFor="site-password" className="field-label">Password</label>
          <Input
            id="site-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            required
          />
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <Button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Checking access" : "Continue"}
          </Button>
        </form>
      </section>
    </main>
  );
}

function LoadingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = ["Verifying access", "Loading downloader", "Preparing latest build data"];

  useEffect(() => {
    const interval = window.setInterval(() => setStepIndex((prev) => (prev + 1) % steps.length), 900);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="screen-wrap page-fade">
      <section className="loading-panel" aria-live="polite" role="status">
        <div className="spinner" aria-hidden="true" />
        <p className="supporting-text">{steps[stepIndex]}</p>
      </section>
    </main>
  );
}

function DownloaderPage() {
  const { data: version, isLoading, isError, refetch, isRefetching } = useRobloxVersion();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const releaseLabel = useMemo(() => version || "Unavailable", [version]);

  const beginProgressAnimation = () => {
    const checkpoints = [14, 28, 44, 67, 84, 100];
    checkpoints.forEach((value, index) => {
      window.setTimeout(() => setDownloadProgress(value), 260 * (index + 1));
    });
  };

  const handleDownload = () => {
    if (!version || isDownloading) return;
    setStatus(null);
    setDownloadProgress(8);
    setIsDownloading(true);
    beginProgressAnimation();

    try {
      const downloadUrl = `https://setup.rbxcdn.com/mac/${version}-RobloxPlayer.zip`;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => {
        setStatus({ tone: "success", message: "Download started. Open the ZIP and run RobloxPlayerInstaller." });
      }, 1200);
    } catch {
      setStatus({ tone: "error", message: "Could not start the download. Please try again." });
    } finally {
      window.setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 2300);
    }
  };

  return (
    <main className="app-shell page-fade">
      <div className="app-layout">
        <header className="nav-frame">
          <p className="brand">Sigmund RBX</p>
          <p className="caption">Minimal macOS downloader</p>
        </header>

        <section className="hero-frame">
          <p className="eyebrow">Roblox for macOS</p>
          <h1>Download the latest Roblox build</h1>
          <p className="supporting-text">Reliable access to the latest public Roblox player package for Mac.</p>
        </section>

        <Card className="status-frame">
          <CardHeader>
            <CardTitle>Download status</CardTitle>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="meta-grid">
              <div>
                <p className="meta-label">Platform</p>
                <p className="meta-value">{PLATFORM_LABEL}</p>
              </div>
              <div>
                <p className="meta-label">Latest build</p>
                {isLoading || isRefetching ? (
                  <p className="meta-value muted">Checking build data…</p>
                ) : isError ? (
                  <div className="inline-actions">
                    <p className="meta-value error">Unavailable</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                  </div>
                ) : (
                  <p className="meta-value">{releaseLabel}</p>
                )}
              </div>
            </div>

            <div className="stack-sm">
              <div className="inline-actions">
                <p className="meta-label">Progress</p>
                <p className="meta-label">{Math.round(downloadProgress)}%</p>
              </div>
              <Progress value={downloadProgress} />
            </div>

            <Button onClick={handleDownload} disabled={!version || isDownloading} className="btn-primary">
              {isDownloading ? "Starting download" : "Download for Mac"}
            </Button>

            {status ? <p className={`notice ${status.tone}`}>{status.message}</p> : null}
          </CardContent>
        </Card>
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
      } catch {
        setScreen("password");
      }
    };

    checkAuth();
  }, []);

  const proceedToLoading = () => {
    setScreen("loading");
    window.setTimeout(() => setScreen("downloader"), 2200);
  };

  if (screen === "checking" || screen === "loading") return <LoadingPage />;
  if (screen === "password") return <PasswordPage onSuccess={proceedToLoading} />;
  return <DownloaderPage />;
}

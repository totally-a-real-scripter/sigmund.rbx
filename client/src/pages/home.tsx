import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRobloxVersion } from "@/hooks/use-roblox-version";

const PLATFORM_LABEL = "macOS";
const AUTH_STORAGE_KEY = "site_unlocked";
const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD || "letmein";

function InlineNotice({
  tone,
  title,
  message,
}: {
  tone: "success" | "error";
  title: string;
  message: string;
}) {
  return (
    <div
      className={`notice notice-${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <p className="notice-title">{title}</p>
      <p className="notice-message">{message}</p>
    </div>
  );
}

export default function Home() {
  const { data: version, isLoading, isError, refetch, isRefetching } = useRobloxVersion();
  const [isUnlocked, setIsUnlocked] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) === "true");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | null>(null);

  const releaseLabel = useMemo(() => {
    if (!version) return "Unavailable";
    return version;
  }, [version]);

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput !== SITE_PASSWORD) {
      setPasswordError("Incorrect password. Please try again.");
      return;
    }

    setPasswordError("");
    setShowLoadingScreen(true);

    window.setTimeout(() => {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setIsUnlocked(true);
      setShowLoadingScreen(false);
    }, 900);
  };

  const beginProgressAnimation = () => {
    setDownloadProgress(10);
    const checkpoints = [25, 42, 58, 73, 88, 100];
    checkpoints.forEach((value, index) => {
      window.setTimeout(() => setDownloadProgress(value), 320 * (index + 1));
    });
  };

  const handleDownload = async () => {
    if (!version || isDownloading) return;

    setStatusMessage("");
    setStatusTone(null);
    setIsDownloading(true);
    beginProgressAnimation();

    try {
      const downloadUrl = `https://setup.rbxcdn.com/mac/${version}-RobloxPlayer.zip`;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => {
        setStatusTone("success");
        setStatusMessage("Download started. Open the ZIP file and run RobloxPlayerInstaller.");
      }, 1200);
    } catch {
      setStatusTone("error");
      setStatusMessage("Could not start the download. Please try again.");
    } finally {
      window.setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 2200);
    }
  };

  if (!isUnlocked) {
    return (
      <main className="page-shell auth-shell">
        <div className="page-glow" aria-hidden="true" />
        <Card className="glass-panel auth-card fade-in">
          <CardHeader>
            <CardTitle>Protected Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="auth-copy">Enter the site password to continue.</p>
            <form onSubmit={handleUnlock} className="auth-form">
              <Input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <Button type="submit" className="primary-action">Unlock site</Button>
            </form>
            {passwordError && <p className="auth-error">{passwordError}</p>}
          </CardContent>
        </Card>

        {showLoadingScreen && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="loading-card glass-panel">
              <p>Loading downloader…</p>
              <div className="loading-bar" aria-hidden="true" />
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-glow" aria-hidden="true" />
      <div className="layout fade-in">
        <header className="top-nav glass-panel">
          <p className="app-name">Roblox Mac Downloader</p>
          <nav aria-label="Primary" className="nav-links">
            <a href="#home">Home</a>
            <a href="#download">Download</a>
            <a href="#help">Help</a>
          </nav>
        </header>

        <section id="home" className="hero glass-panel">
          <p className="hero-kicker">Fast setup for {PLATFORM_LABEL}</p>
          <h1>Install Roblox on macOS</h1>
          <p className="hero-copy">
            Download the latest Roblox player package for Mac and follow a simple, guided setup flow.
          </p>
          <div className="hero-actions">
            <Button
              onClick={handleDownload}
              disabled={!version || isLoading || isDownloading}
              className="primary-action"
              data-testid="button-download-hero"
            >
              {isDownloading ? "Starting download" : "Download for Mac"}
            </Button>
            <Button asChild variant="outline" className="secondary-action">
              <a href="#help">View instructions</a>
            </Button>
          </div>
        </section>

        <Card id="download" className="glass-panel main-card">
          <CardHeader>
            <CardTitle>Download status</CardTitle>
          </CardHeader>
          <CardContent className="status-grid">
            <div>
              <p className="label">Detected platform</p>
              <p className="value">{PLATFORM_LABEL}</p>
            </div>
            <div>
              <p className="label">Current Roblox build</p>
              {isLoading || isRefetching ? (
                <div className="skeleton-line" aria-hidden="true" />
              ) : isError ? (
                <div className="inline-row">
                  <p className="value value-error">Unable to load</p>
                  <Button variant="outline" onClick={() => refetch()} size="sm" data-testid="button-retry">
                    Retry
                  </Button>
                </div>
              ) : (
                <p className="value" data-testid="version-display">{releaseLabel}</p>
              )}
            </div>
            <div className="progress-wrap" aria-live="polite">
              <div className="inline-row">
                <p className="label">Progress</p>
                <p className="value value-subtle">{Math.round(downloadProgress)}%</p>
              </div>
              <Progress value={downloadProgress} />
            </div>
            {statusTone && statusMessage && (
              <InlineNotice
                tone={statusTone}
                title={statusTone === "success" ? "Download ready" : "Action required"}
                message={statusMessage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

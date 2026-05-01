import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRobloxVersion } from "@/hooks/use-roblox-version";

const PLATFORM_LABEL = "macOS";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusTone, setStatusTone] = useState<"success" | "error" | null>(null);

  const releaseLabel = useMemo(() => {
    if (!version) return "Unavailable";
    return version;
  }, [version]);

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

        <section id="help" className="info-grid">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Installation steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="steps">
                <li><span>1</span>Download the latest ZIP package.</li>
                <li><span>2</span>Open the ZIP and run the installer file.</li>
                <li><span>3</span>Finish setup and launch Roblox from Applications.</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="faq-list">
                <article>
                  <h3>Installer blocked by macOS</h3>
                  <p>Open System Settings, then Privacy & Security, and allow RobloxPlayerInstaller to run.</p>
                </article>
                <article>
                  <h3>Download did not begin</h3>
                  <p>Check popup settings and retry. The downloader opens the Roblox package in a new tab.</p>
                </article>
                <article>
                  <h3>App does not launch</h3>
                  <p>Restart macOS and reinstall with the latest package shown in the status card.</p>
                </article>
              </div>
            </CardContent>
          </Card>
        </section>

        <footer className="footer glass-panel">
          <p>Roblox Mac Downloader</p>
          <p>Build source from Roblox release endpoints</p>
        </footer>
      </div>
    </main>
  );
}

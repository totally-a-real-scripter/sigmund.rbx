import { useEffect, useState } from "react";
import {
  AppWindow, ArrowRight, Download, Eye, EyeOff, FolderOpen, Ghost, Hand, KeyRound, Laptop, Lock,
  MousePointerClick, PackageOpen, RefreshCw, ShieldCheck, Sparkles, Zap,
} from "lucide-react";
import { Footer, Logo, TopBar } from "@/components/chrome";
import { fetchRobloxLatestInfo, useRobloxVersion } from "@/hooks/use-roblox-version";

/* ---------- sign in ---------- */

function PasswordPage({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fail = (message: string) => {
    setError(message);
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return fail("Type the password first.");
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) return fail("That's not it. Check the password and try again.");
      onSuccess();
    } catch {
      fail("Sign-in is down for a moment. Try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar />
      <main className="center page-fade">
        <div className="auth">
          <section className="auth-copy">
            <span className="eyebrow"><Lock className="ico" /> Members only</span>
            <h1>Roblox on your Mac, <mark>no fuss.</mark></h1>
            <p>The latest Roblox build for macOS, straight from Roblox's servers. Sign in to grab it.</p>
          </section>
          <section className="panel" aria-labelledby="auth-title">
            <span className="label">Sigmund:rbx</span>
            <h2 id="auth-title">Sign in</h2>
            <p className="sub">Enter the site password to continue.</p>
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor="site-password" className="label" style={{ display: "block", marginBottom: 8 }}>Password</label>
              <div className={`field${error ? " bad" : ""}${shake ? " shake" : ""}`}>
                <KeyRound className="ico" aria-hidden="true" />
                <input
                  id="site-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                />
                <button type="button" className="peek" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff className="ico" /> : <Eye className="ico" />}
                </button>
              </div>
              <button type="submit" className="go" disabled={submitting}>
                {submitting ? <RefreshCw className="ico spin" /> : <ArrowRight className="ico" />}
                {submitting ? "Checking…" : "Let me in"}
              </button>
              <p className={`msg${error ? " err" : ""}`} role="alert">{error}</p>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}

/* ---------- loading ---------- */

function LoadingPage() {
  const steps = ["Checking your pass", "Dusting off the cabinet", "Asking Roblox what's new"];
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStepIndex((i) => (i + 1) % steps.length), 900);
    return () => window.clearInterval(id);
  }, []);
  return (
    <main className="center page-fade" style={{ minHeight: "100vh" }} role="status" aria-live="polite">
      <div className="loading">
        <Logo />
        <div className="bar" aria-hidden="true"><i /></div>
        <span className="label">{steps[stepIndex]}</span>
      </div>
    </main>
  );
}

/* ---------- downloader ---------- */

const STEPS = [
  { icon: Download, c: "#ffc93c", title: "Download", body: <>Hit <b>Download for macOS</b>. You get a <code>.zip</code> from Roblox's servers.</> },
  { icon: PackageOpen, c: "#57b7ff", title: "Unzip it", body: <>Double-click the zip in <kbd>Downloads</kbd> to get <code>RobloxPlayer</code>.</> },
  { icon: FolderOpen, c: "#b8e05a", title: "Move it", body: <>Drag the app into <kbd>Applications</kbd> so it stays put.</> },
  { icon: MousePointerClick, c: "#ff8ad8", title: "Open it", body: <>First launch, right-click → <kbd>Open</kbd> if macOS asks. Then you're in.</> },
];

const NOTES = [
  { icon: Hand, c: "#ffc93c", title: "whats ups", body: "yogurt gurt: yo" },
  { icon: ShieldCheck, c: "#1fc7b2", title: "hello admins", body: "TNTIWD" },
  { icon: Ghost, c: "#b39cff", title: "what in the what", body: "if hes invincible why can i still see him" },
  { icon: Sparkles, c: "#ff8ad8", title: "4th card", body: "yeah" },
];

function DownloaderPage({ onSignOut }: { onSignOut: () => void }) {
  const { data, isLoading, isError, refetch, isRefetching } = useRobloxVersion();
  const [isDownloading, setIsDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const busy = isLoading || isRefetching || refreshing;
  const state: "busy" | "bad" | "ok" = busy ? "busy" : isError || !data ? "bad" : "ok";
  const statusText = { busy: "Checking the current Roblox release…", bad: "Couldn't reach Roblox right now. Try refreshing.", ok: "Up to date. Ready to download." }[state];

  const refreshBuildInfo = async () => {
    setRefreshing(true);
    try {
      await fetchRobloxLatestInfo(true);
      await refetch();
    } catch {
      /* state shows the error */
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    window.location.assign("/api/roblox/download");
    window.setTimeout(() => setIsDownloading(false), 1500);
  };

  const canDownload = !!data && !busy && !isError && !isDownloading;
  const checked = data?.lastChecked ? new Date(data.lastChecked).toLocaleString() : "Not yet";

  return (
    <>
      <TopBar
        onSignOut={onSignOut}
        rail={
          <>
            <a className="pill" href="#latest" style={{ ["--c" as string]: "#ffc93c" }}><Zap className="ico" />Latest build</a>
            <a className="pill" href="#install" style={{ ["--c" as string]: "#57b7ff" }}><AppWindow className="ico" />How to install</a>
            <a className="pill" href="#notes" style={{ ["--c" as string]: "#ff8ad8" }}><Sparkles className="ico" />Notes</a>
          </>
        }
      >
        <button className="tbtn teal has-label" onClick={refreshBuildInfo} disabled={busy} title="Check for a newer build">
          <RefreshCw className={`ico${busy ? " spin" : ""}`} />
          <span className="tbtn-label">Refresh</span>
        </button>
      </TopBar>

      <main className="main page-fade">
        <section className="drop block" id="latest">
          <div className="drop-main">
            <div className="art">
              <div className="art-grid" />
              <span className="stamp"><small>LATEST BUILD</small><b>{data?.channel ?? "LIVE"}</b></span>
              <span className="art-mark"><Laptop className="ico" /></span>
              <span className="art-chip">{data?.source ?? "setup.rbxcdn.com"}</span>
            </div>
            <div className="drop-body">
              <div style={{ minWidth: 0 }}>
                <span className="label">Roblox for macOS</span>
                <h1>Get the newest Mac build</h1>
                <div className="tags">
                  <span className="tag">{data?.platform ?? "macOS"}</span>
                  <span className="tag">Official zip</span>
                  <span className={`tag ${state === "ok" ? "ok" : state === "bad" ? "bad" : ""}`}>{state === "ok" ? "Ready" : state === "bad" ? "Offline" : "Checking"}</span>
                </div>
              </div>
              <button className="go" onClick={handleDownload} disabled={!canDownload}>
                {isDownloading ? <RefreshCw className="ico spin" /> : <Download className="ico" />}
                {isDownloading ? "Starting…" : "Download for macOS"}
              </button>
            </div>
          </div>

          <aside className="lineup" aria-labelledby="buildTitle">
            <div className="lineup-head">
              <h2 id="buildTitle">Build info</h2>
              <span className="label">auto-checks</span>
            </div>
            <ol>
              <li><span className="num">01</span><span><span className="label k">Version</span><b className="mono">{data?.version ?? (busy ? "…" : "Unavailable")}</b></span></li>
              <li><span className="num">02</span><span><span className="label k">Channel</span><b>{data?.channel ?? "—"}</b></span></li>
              <li><span className="num">03</span><span><span className="label k">Platform</span><b>{data?.platform ?? "macOS"}</b></span></li>
              <li><span className="num">04</span><span><span className="label k">Last checked</span><b>{checked}</b></span></li>
            </ol>
            <div className="status" role="status" aria-live="polite">
              <span className={`dot ${state}`} />
              {statusText}
            </div>
          </aside>
        </section>

        <section className="block" id="install">
          <div className="head">
            <div><span className="label">Four steps</span><h2>How to install</h2></div>
          </div>
          <div className="grid">
            {STEPS.map((s, i) => (
              <article className="card" key={s.title} style={{ ["--c" as string]: s.c }}>
                <span className="sticker">Step {i + 1}</span>
                <span className="badge-ico"><s.icon className="ico" /></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="block" id="notes">
          <div className="head">
            <div><span className="label">From the desk</span><h2>Notes</h2></div>
          </div>
          <div className="plats">
            {NOTES.map((n, i) => (
              <article className="plat" key={n.title} style={{ ["--c" as string]: n.c }}>
                <span className="big-ico"><n.icon className="ico" /></span>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <span className="count">#{String(i + 1).padStart(2, "0")}</span>
              </article>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

/* ---------- screen switcher ---------- */

export default function Home() {
  const [screen, setScreen] = useState<"checking" | "password" | "loading" | "downloader">("checking");

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth/status", { credentials: "include" });
        const data = await response.json();
        setScreen(data.authenticated ? "downloader" : "password");
      } catch {
        setScreen("password");
      }
    })();
  }, []);

  const proceedToLoading = () => {
    setScreen("loading");
    window.setTimeout(() => setScreen("downloader"), 1800);
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setScreen("password");
    }
  };

  if (screen === "checking" || screen === "loading") return <LoadingPage />;
  if (screen === "password") return <PasswordPage onSuccess={proceedToLoading} />;
  return <DownloaderPage onSignOut={signOut} />;
}

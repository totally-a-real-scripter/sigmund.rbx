import { useEffect, useState, type ReactNode } from "react";
import { LogOut, RotateCcw, Settings as SettingsIcon, X } from "lucide-react";
import { ACCENTS, THEMES, useSettings } from "@/lib/settings";

export function Logo() {
  return (
    <span className="logo-box">
      <span>Sigmund</span>
      <span>:rbx</span>
    </span>
  );
}

interface TopBarProps {
  children?: ReactNode; // extra buttons, shown left of Settings
  rail?: ReactNode; // pill row under the bar
  onSignOut?: () => void;
}

export function TopBar({ children, rail, onSignOut }: TopBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="top">
        <div className="top-inner">
          <a className="logo" href="/" aria-label="Home">
            <Logo />
          </a>
          <div className="top-spacer" />
          {children}
          <button className="tbtn icon-only" title="Settings" aria-label="Settings" onClick={() => setOpen(true)}>
            <SettingsIcon className="ico" />
          </button>
        </div>
        {rail ? <nav className="rail" aria-label="Sections">{rail}</nav> : null}
      </header>
      {open ? <SettingsDialog onClose={() => setOpen(false)} onSignOut={onSignOut} /> : null}
    </>
  );
}

function SettingsDialog({ onClose, onSignOut }: { onClose: () => void; onSignOut?: () => void }) {
  const { settings, update, reset } = useSettings();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="settings" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-box page-fade" role="dialog" aria-modal="true" aria-labelledby="setTitle">
        <div className="set-head">
          <div>
            <span className="label">Make it yours</span>
            <h2 id="setTitle">Settings</h2>
          </div>
          <button className="tbtn icon-only" aria-label="Close settings" onClick={onClose} autoFocus>
            <X className="ico" />
          </button>
        </div>
        <div className="set-body">
          <div className="set-group">
            <span className="label">Theme</span>
            <div className="themes">
              {THEMES.map((t) => (
                <button key={t.id} className="theme-opt" aria-pressed={settings.theme === t.id} onClick={() => update({ theme: t.id })}>
                  <span className="sw">
                    {t.swatch.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </span>
                  <b>{t.name}</b>
                  <small>{t.note}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="set-group">
            <span className="label">Accent</span>
            <div className="swatches">
              {ACCENTS.map(([id, hex]) => (
                <button
                  key={id}
                  className="swatch"
                  title={id}
                  aria-label={`${id} accent`}
                  aria-pressed={settings.accent === id}
                  style={{ ["--sw" as string]: hex }}
                  onClick={() => update({ accent: id })}
                />
              ))}
            </div>
          </div>
          <div className="set-group">
            <div className="toggle-row">
              <span>
                <b>Animations</b>
                <small>Wobbles, slides and hover lifts.</small>
              </span>
              <button className="switch" role="switch" aria-checked={settings.motion} aria-label="Animations" onClick={() => update({ motion: !settings.motion })} />
            </div>
          </div>
          <div className="set-group" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="tbtn" onClick={reset}>
              <RotateCcw className="ico" /> Reset look
            </button>
            {onSignOut ? (
              <button className="tbtn" onClick={onSignOut}>
                <LogOut className="ico" /> Sign out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span>Sigmund:rbx · part of the Sigmund:re family</span>
      <span>Downloads come straight from Roblox's own servers.</span>
    </footer>
  );
}

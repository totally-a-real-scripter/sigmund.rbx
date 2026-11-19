import { Home } from "lucide-react";
import { TopBar } from "@/components/chrome";

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="center page-fade">
        <div className="empty">
          <b>404</b>
          <p>Nothing here. This page wandered off.</p>
          <a className="tbtn" href="/"><Home className="ico" /> Back home</a>
        </div>
      </main>
    </>
  );
}

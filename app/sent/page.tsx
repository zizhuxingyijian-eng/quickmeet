import { Suspense } from "react";
import { SentClient } from "./SentClient";

export default function SentPage() {
  return (
    <Suspense
      fallback={
        <main className="main-shell">
          <div className="card">
            <div className="card-title">Loading sent requests…</div>
          </div>
        </main>
      }
    >
      <SentClient />
    </Suspense>
  );
}

// app/inbox/page.tsx
import { Suspense } from "react";
import { InboxClient } from "./InboxClient";
import { TopNav } from "../TopNav";

export default function InboxPage() {
  return (
    <>
      <TopNav />
      <Suspense
        fallback={
          <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
            <h1>Loading inbox…</h1>
          </main>
        }
      >
        <InboxClient />
      </Suspense>
    </>
  );
}

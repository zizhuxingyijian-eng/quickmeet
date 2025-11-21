// app/sent/page.tsx
import { Suspense } from "react";
import { SentClient } from "./SentClient";
import { TopNav } from "../TopNav";

export default function SentPage() {
  return (
    <>
      <TopNav />
      <Suspense
        fallback={
          <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
            <h1>Loading sent requests…</h1>
          </main>
        }
      >
        <SentClient />
      </Suspense>
    </>
  );
}

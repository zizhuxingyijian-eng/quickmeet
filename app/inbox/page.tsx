import { Suspense } from "react";
import { InboxClient } from "./InboxClient";

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
          <h1>加载中...</h1>
        </main>
      }
    >
      <InboxClient />
    </Suspense>
  );
}

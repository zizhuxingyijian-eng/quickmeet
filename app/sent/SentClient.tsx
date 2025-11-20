"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Request = {
  id: string;
  from_name: string;
  to_name: string;
  from_email: string | null;
  to_email: string | null;
  date: string;
  start_time: string;
  duration_minutes: number;
  place: string;
  note: string | null;
  status: "pending" | "accepted" | "rejected";
};

export function SentClient() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    if (!name) return;
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("from_name", name)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMsg("Failed to load your sent requests.");
    } else {
      setRequests(data as Request[]);
      if (!data || data.length === 0) {
        setMsg("You haven't sent any requests yet.");
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  if (!name) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Sent requests</div>
          <div className="card-subtitle">
            Add your name to the URL to see what you’ve sent.
          </div>
          <div className="small-hint">
            Example: <code>/sent?name=Alex</code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-title">{name} · Sent requests</div>
        <div className="card-subtitle">
          All QuickMeet requests you have sent out.
        </div>

        <div className="btn-row">
          <button type="button" className="btn-ghost" onClick={load}>
            Refresh
          </button>
          <div className="small-hint">
            Share this URL only with yourself. Others can’t change your
            outgoing requests.
          </div>
        </div>

        {loading && <div className="feedback">Loading…</div>}
        {msg && <div className="feedback">{msg}</div>}

        <div className="list">
          {requests.map((r) => (
            <div key={r.id} className="request-item">
              <div className="request-main">
                <div>
                  <strong>You</strong> → {r.to_name}
                </div>
                <div
                  className={
                    "tag " +
                    (r.status === "pending"
                      ? "pending"
                      : r.status === "accepted"
                      ? "accepted"
                      : "rejected")
                  }
                >
                  {r.status === "pending"
                    ? "Pending"
                    : r.status === "accepted"
                    ? "Accepted"
                    : "Rejected"}
                </div>
              </div>
              <div className="request-meta">
                📅 {r.date} · {r.start_time} · {r.duration_minutes} min
              </div>
              <div className="request-meta">📍 {r.place}</div>
              {r.note && <div className="request-note">📝 {r.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

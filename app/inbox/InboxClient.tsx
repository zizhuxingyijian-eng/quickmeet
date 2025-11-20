"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Request = {
  id: string;
  from_name: string;
  to_name: string;
  date: string;
  start_time: string;
  duration_minutes: number;
  place: string;
  note: string | null;
  status: "pending" | "accepted" | "rejected";
};

export function InboxClient() {
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
      .eq("to_name", name)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMsg("Failed to load requests.");
    } else {
      setRequests(data as Request[]);
      if (!data || data.length === 0) {
        setMsg("No requests yet.");
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Failed to update status.");
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  if (!name) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Inbox</div>
          <div className="card-subtitle">
            Add your name to the URL to see your requests.
          </div>
          <div className="small-hint">
            Example: <code>/inbox?name=Jamie</code>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-title">{name} · Inbox</div>
        <div className="card-subtitle">
          All QuickMeet requests sent to you.
        </div>

        <div className="btn-row">
  <button type="button" className="btn-ghost" onClick={load}>
    Refresh
  </button>

  {name && (
    <button
      type="button"
      className="btn-ghost"
      onClick={() => {
        window.location.href = `/sent?name=${encodeURIComponent(name)}`;
      }}
    >
      View requests you sent
    </button>
  )}

  <div className="small-hint">
    Share this link with people who want to send <strong>{name}</strong> a request.
  </div>
</div>


        {loading && <div className="feedback">Loading…</div>}
        {msg && <div className="feedback">{msg}</div>}

        <div className="list">
          {requests.map((r) => (
            <div key={r.id} className="request-item">
              <div className="request-main">
                <div>
                  <strong>{r.from_name}</strong> → {r.to_name}
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

              {r.status === "pending" && (
                <div className="item-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => updateStatus(r.id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => updateStatus(r.id, "rejected")}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

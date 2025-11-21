"use client";

import { useEffect, useState } from "react";
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

export function InboxClient() {
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 进页面先拿当前登录用户的邮箱
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("getUser error:", error);
        setMsg("Failed to get current user.");
        setAuthChecking(false);
        return;
      }

      const email = data.user?.email ?? null;

      if (email) {
        setUserEmail(email);
        await load(email);
      } else {
        // 没有登录 / 没有邮箱
        setUserEmail(null);
        setMsg("Please sign in with Google to view your inbox.");
      }

      setAuthChecking(false);
    })();
  }, []);

  async function load(email: string) {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("to_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("load inbox error:", error);
      setMsg(error.message || "Failed to load requests.");
    } else {
      setRequests((data || []) as Request[]);
      if (!data || data.length === 0) {
        setMsg("No requests yet.");
      }
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    setMsg(null);

    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("updateStatus error:", error);
      setMsg(error.message || "Failed to update status.");
      return;
    }

    // 本地状态同步
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  // 还在查当前登录状态
  if (authChecking) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Inbox</div>
          <div className="card-subtitle">Checking your session…</div>
        </div>
      </main>
    );
  }

  // 没登录：必须先用 Google 登录
  if (!userEmail) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Inbox</div>
          <div className="card-subtitle">
            Please sign in with Google to view your inbox.
          </div>
        </div>
      </main>
    );
  }

  // 已登录，正常显示 inbox
  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-title">Inbox · {userEmail}</div>
        <div className="card-subtitle">
          All meet-up requests sent to your account.
        </div>

        <div className="btn-row">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => load(userEmail)}
          >
            Refresh
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              window.location.href = "/sent";
            }}
          >
            View requests you sent
          </button>
        </div>

        {loading && <div className="feedback">Loading…</div>}
        {msg && <div className="feedback">{msg}</div>}

        <div className="list">
          {requests.map((r) => (
            <div key={r.id} className="request-item">
              <div className="request-main">
                <div>
                  <strong>{r.from_email || r.from_name}</strong> →{" "}
                  {r.to_email || r.to_name || "You"}
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
                    ? "pending"
                    : r.status === "accepted"
                    ? "accepted"
                    : "rejected"}
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

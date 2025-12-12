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

  function formatTime(value: string) {
    // start_time 来自数据库通常是 HH:MM:SS，这里裁掉秒数
    const parts = value.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : value;
  }

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    setMsg(null);

    // 1. 更新数据库里的状态
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("updateStatus error:", error);
      setMsg(error.message || "Failed to update status.");
      return;
    }

    // 2. 本地状态同步
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    // 3. 在当前状态里找到这条 request（A → B 那条）
    const current = requests.find((r) => r.id === id);
    if (!current) {
      console.warn("No request found in state for id:", id, requests);
      return;
    }

    console.log("[updateStatus] replying for request:", current);

    // 4. 发邮件给 A（from_email 是 A 的邮箱）
    try {
      const res = await fetch("/api/notify-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: current.from_email, // ⭐ A 的邮箱（一定要有）
          toName: current.from_name,
          fromEmail: current.to_email, // B 的邮箱
          fromName: current.to_name,
          date: current.date,
          startTime: current.start_time,
          durationMinutes: current.duration_minutes,
          place: current.place,
          note: current.note,
          status,
        }),
      });

      console.log("[updateStatus] notify-reply status:", res.status);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[updateStatus] notify-reply failed:", data);
      }
    } catch (err) {
      console.error("[updateStatus] notify reply failed:", err);
    }
  }


  

  // 还在查当前登录状态
  if (authChecking) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-header">
            <div className="seal" lang="ja">
              信
            </div>
            <div>
              <div className="card-title">Inbox</div>
              <div className="card-subtitle">Checking your session…</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 没登录：必须先用 Google 登录
  if (!userEmail) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-header">
            <div className="seal" lang="ja">
              信
            </div>
            <div>
              <div className="card-title">Inbox</div>
              <div className="card-subtitle">
                Please sign in with Google to view your inbox.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 已登录，正常显示 inbox
  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-header">
          <div className="seal" lang="ja">
            信
          </div>
          <div>
            <div className="card-title">Inbox · {userEmail}</div>
            <div className="card-subtitle">
              All meet-up requests sent to your account.
            </div>
          </div>
        </div>

        <div className="card-section">
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
        </div>

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
                📅 {r.date} · {formatTime(r.start_time)} · {r.duration_minutes} min
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

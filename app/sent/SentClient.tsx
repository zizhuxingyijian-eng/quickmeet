"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email: string | null;
};

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
  from_user_id: string | null;
  to_user_id: string | null;
};

export function SentClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 先查当前登录用户
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null, // ⭐ 关键：避免 string | undefined
        });
      } else {
        setUser(null);
      }
      setAuthChecking(false);
    });
  }, []);

  async function load() {
    if (!user) return;
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("from_user_id", user.id)
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
    if (user) {
      load();
    }
  }, [user]);

  // 还在查登录状态
  if (authChecking) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Sent requests</div>
          <div className="card-subtitle">Checking your session…</div>
        </div>
      </main>
    );
  }

  // 没登录
  if (!user) {
    return (
      <main className="main-shell">
        <div className="card">
          <div className="card-title">Sent requests</div>
          <div className="card-subtitle">
            Please sign in with Google on the home page to see your sent
            requests.
          </div>
        </div>
      </main>
    );
  }

  // 已登录，正常显示发件记录
  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-title">Sent requests</div>
        <div className="card-subtitle">
          These are the requests you’ve sent with QuickMeet.
        </div>

        {loading && <div className="feedback">Loading…</div>}
        {msg && <div className="feedback">{msg}</div>}

        <div className="list">
          {requests.map((r) => (
            <div key={r.id} className="request-item">
              <div className="request-main">
                <div>
                  You →{" "}
                  <strong>
                    {r.to_email || r.to_name || "Unknown recipient"}
                  </strong>
                </div>
                <div className="tag">
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
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

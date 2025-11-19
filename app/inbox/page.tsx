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

export default function InboxPage() {
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
      setMsg("❌ 加载失败");
    } else {
      setRequests(data as Request[]);
      if (!data || data.length === 0) {
        setMsg("目前没有任何约见请求。");
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
      setMsg("❌ 更新状态失败");
      return;
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  if (!name) {
    return (
      <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
        <h1>收件箱</h1>
        <p>请在地址栏后面加上你的名字，例如：</p>
        <pre style={{ background: "#f4f4f5", padding: 12, borderRadius: 8 }}>
          /inbox?name=Yuki
        </pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h1>{name} 的约见收件箱</h1>

      <button
        type="button"
        onClick={load}
        style={{ marginBottom: 16, padding: "6px 12px", borderRadius: 999 }}
      >
        刷新
      </button>

      {loading && <p>加载中...</p>}
      {msg && <p style={{ marginBottom: 12 }}>{msg}</p>}

      {requests.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #e4e4e7",
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <strong>{r.from_name}</strong> → {r.to_name} ·{" "}
            {r.status === "pending"
              ? "待回复"
              : r.status === "accepted"
              ? "已同意"
              : "已拒绝"}
          </div>
          <div>
            📅 {r.date} {r.start_time} · {r.duration_minutes} 分钟
          </div>
          <div>📍 {r.place}</div>
          {r.note && <div>📝 {r.note}</div>}

          {r.status === "pending" && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => updateStatus(r.id, "accepted")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  marginRight: 8,
                }}
              >
                同意
              </button>
              <button
                type="button"
                onClick={() => updateStatus(r.id, "rejected")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#fee2e2",
                }}
              >
                拒绝
              </button>
            </div>
          )}
        </div>
      ))}
    </main>
  );
}

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit() {
    if (!from || !to || !date || !startTime || !duration || !place) {
      setMsg("请把必填项填完！");
      return;
    }

    const { error } = await supabase.from("requests").insert({
      from_name: from,
      to_name: to,
      date,
      start_time: startTime,
      duration_minutes: Number(duration),
      place,
      note,
      status: "pending",
    });

    if (error) {
      console.error(error);
      setMsg("❌ 发送失败，请重试");
      return;
    }

    setMsg("✅ 已成功发送约见请求！");
    
    // 清空部分字段
    setDate("");
    setStartTime("");
    setDuration("");
    setPlace("");
    setNote("");
  }

  return (
    <main style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>QuickMeet · 发起约见</h1>

      <label>你的名字</label>
      <input value={from} onChange={(e) => setFrom(e.target.value)} />

      <label>对方名字</label>
      <input value={to} onChange={(e) => setTo(e.target.value)} />

      <label>日期</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>开始时间</label>
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

      <label>时长（分钟）</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="例如 60"
      />

      <label>地点</label>
      <input value={place} onChange={(e) => setPlace(e.target.value)} />

      <label>备注（可选）</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} />

      <button type="button" onClick={handleSubmit}>
        发出申请
      </button>

      {msg && (
        <p style={{ marginTop: 16, color: "#4f46e5" }}>
          {msg}
        </p>
      )}
    </main>
  );
}

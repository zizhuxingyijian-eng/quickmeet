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
  const [error, setError] = useState(false);

  async function handleSubmit() {
    setMsg(null);
    setError(false);

    if (!from || !to || !date || !startTime || !duration || !place) {
      setMsg("Please fill in all required fields.");
      setError(true);
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
      setMsg("Something went wrong. Please try again.");
      setError(true);
      return;
    }

    setMsg("Request sent successfully!");
    setError(false);

    setDate("");
    setStartTime("");
    setDuration("");
    setPlace("");
    setNote("");
  }

  return (
    <main className="main-shell">
      <div className="card">
        <div className="card-title">QuickMeet · Send a request</div>
        <div className="card-subtitle">
          Pick a time, place, and send a lightweight meet-up request.
        </div>

        <div className="form-grid">
          <div>
            <div className="field-label">Your name</div>
            <input
              placeholder="Alex"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <div className="field-label">Their name</div>
            <input
              placeholder="Jamie"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div style={{ flex: 1 }}>
              <div className="field-label">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="field-label">Start time</div>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div style={{ flexBasis: 120 }}>
              <div className="field-label">Duration (min)</div>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <div className="field-label">Place</div>
            <input
              placeholder="Coffee shop, campus, online..."
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </div>

          <div>
            <div className="field-label">Note (optional)</div>
            <textarea
              placeholder="Any context or preference you’d like to add."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            <span>Send request</span>
            <span>↗</span>
          </button>
          <span className="badge">
            Their inbox URL: <code>/inbox?name=TheirName</code>
          </span>
        </div>

        {msg && (
          <div className={`feedback ${error ? "error" : ""}`}>{msg}</div>
        )}
      </div>
    </main>
  );
}

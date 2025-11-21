"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TopNav } from "./TopNav";

type AuthedUser = {
  id: string;
  email: string | null;
};

type Contact = {
  id: string;
  contact_email: string;
  contact_name: string | null;
  times_used: number;
  last_used_at: string;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthedUser | null>(null);

  const [from, setFrom] = useState("");
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);

  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // AuthBar 传上来的当前用户
  function handleUserChange(u: AuthedUser | null) {
    setCurrentUser(u);
    if (u?.email) {
      setFrom(u.email); // 登录后自动填「Your email」
    }
  }

  // 载入当前用户的常用联系人
  async function loadContacts(userId: string) {
    setContactsLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("owner_user_id", userId)
      .order("last_used_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setContacts(data as Contact[]);
    }
    setContactsLoading(false);
  }

  // 只要 currentUser 变了，就拉一次联系人
  useEffect(() => {
    if (currentUser?.id) {
      loadContacts(currentUser.id);
    }
  }, [currentUser]);

  // 保存 / 更新联系人
  async function saveContact() {
    if (!currentUser?.id || !to) return;

    const { error } = await supabase.from("contacts").upsert(
      {
        owner_user_id: currentUser.id,
        contact_email: to.trim(),
        contact_name: null,
        last_used_at: new Date().toISOString(),
        // times_used 会在后续 update 里自动 +1，这里先留默认值
      },
      {
        onConflict: "owner_user_id,contact_email",
      }
    );

    if (!error) {
      // 发送成功后，顺便刷新一下联系人列表（让最新的排前面）
      loadContacts(currentUser.id);
    }
  }

    async function handleSubmit() {
  setMsg(null);
  setError(false);

  const fromEmail = from.trim();
  const toEmail = to.trim();

  if (!fromEmail || !toEmail || !date || !startTime || !duration || !place) {
    setMsg("Please fill in all required fields.");
    setError(true);
    return;
  }

  // 1. 先写入数据库
  const { error } = await supabase.from("requests").insert({
    from_name: fromEmail,
    to_name: toEmail,
    from_email: fromEmail,
    to_email: toEmail,
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

  // 2. 再尝试发邮件（失败也不要影响前端 success 提示）
  try {
    await fetch("/api/notify-new-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail,
        toName: toEmail, // 现在我们用邮箱当 name，之后你可以扩展成真正的名字
        fromEmail,
        fromName: fromEmail,
        date,
        startTime,
        durationMinutes: Number(duration),
        place,
        note,
      }),
    });
  } catch (err) {
    console.error("failed to call notify API", err);
    // 不弹 error，最多你自己在 console 看就行
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
    <>
      <TopNav onUserChange={handleUserChange} />

      <main className="main-shell">
        <div className="card">
          <div className="card-title">QuickMeet · Send a request</div>
          <div className="card-subtitle">
            Pick a time, place, and send a lightweight meet-up request.
          </div>

          <div className="form-grid">
            <div>
              <div className="field-label">Your email</div>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
  <div className="field-label">Their email</div>

  <div className="email-autocomplete">
    <input
      value={to}
      onChange={(e) => {
        setTo(e.target.value);
        setEmailDropdownOpen(true);
      }}
      onFocus={() => setEmailDropdownOpen(true)}
      onBlur={() => {
        // 给点击选项一点点时间，不然一 blur 下拉框就消失了
        setTimeout(() => setEmailDropdownOpen(false), 150);
      }}
      placeholder="friend@gmail.com"
    />

    {currentUser &&
      emailDropdownOpen &&
      contacts.length > 0 && (
        <div className="email-dropdown">
          {contacts
            .filter((c) =>
              c.contact_email
                .toLowerCase()
                .includes(to.trim().toLowerCase())
            )
            .map((c) => (
              <button
                key={c.id}
                type="button"
                className="email-option"
                onMouseDown={(e) => {
                  // 用 onMouseDown 避免 input blur 抢先触发
                  e.preventDefault();
                  setTo(c.contact_email);
                  setEmailDropdownOpen(false);
                }}
              >
                {c.contact_email}
              </button>
            ))}
        </div>
      )}
  </div>

  {currentUser && contacts.length === 0 && (
    <div className="small-hint" style={{ marginTop: 4 }}>
      No contacts yet – send a request first.
    </div>
  )}
</div>


            <div>
              <div className="field-label">Date</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <div className="field-label">Start time</div>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <div className="field-label">Duration (minutes)</div>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
            </div>

            <div>
              <div className="field-label">Place</div>
              <input
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Coffee shop"
              />
            </div>

            <div className="full-row">
              <div className="field-label">Message (optional)</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Hi, how are you doing?"
              />
            </div>
          </div>

          {msg && <div className={error ? "error-msg" : "ok-msg"}>{msg}</div>}

          <button className="btn-main" onClick={handleSubmit}>
            Send request
          </button>
        </div>
      </main>
    </>
  );
}

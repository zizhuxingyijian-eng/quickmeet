"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email: string | null;
};

export function AuthBar({
  onUserChange,
}: {
  onUserChange?: (user: User | null) => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 进页面先拿一次当前用户
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        const u = { id: data.user.id, email: data.user.email };
        setUser(u);
        onUserChange?.(u);
      }
      setLoading(false);
    });

    // 监听登录状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
        ? { id: session.user.id, email: session.user.email }
        : null;
      setUser(u);
      onUserChange?.(u);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange]);

  const handleLogin = async () => {
    const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // 回到当前完整 URL，而不是只回到根域名
      redirectTo: window.location.href,
    },
  });
};

  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="auth-bar">
      {loading ? (
        <span>Checking session…</span>
      ) : user ? (
        <>
          <span className="auth-email">{user.email}</span>
          <button className="btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </>
      ) : (
        <button className="btn-ghost" onClick={handleLogin}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}

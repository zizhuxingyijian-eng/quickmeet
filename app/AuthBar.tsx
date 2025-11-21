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
    // 初次载入：检查当前用户
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        const u: User = {
          id: data.user.id,
          email: data.user.email ?? null,
        };
        setUser(u);
        onUserChange?.(u);
      } else {
        setUser(null);
        onUserChange?.(null);
      }
      setLoading(false);
    });

    // 监听登录状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u: User | null = session?.user
        ? {
            id: session.user.id,
            email: session.user.email ?? null,
          }
        : null;

      setUser(u);
      onUserChange?.(u);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onUserChange]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href, // 回到当前页
      },
    });
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

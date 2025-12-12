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
    let ignore = false;

    // ⭐ 用 async/await + try/catch/finally，保证无论成功失败都能 setLoading(false)
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (ignore) return;

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
      } catch (e) {
        if (!ignore) {
          console.error("supabase.auth.getUser failed:", e);
          setUser(null);
          onUserChange?.(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    // 监听登录状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) return;

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
      ignore = true;
      subscription.unsubscribe();
    };
  }, [onUserChange]);

  const handleLogin = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;

    const redirectUrl = `${siteUrl}${window.location.pathname}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
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

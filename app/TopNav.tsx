"use client";

import Link from "next/link";
import { AuthBar } from "./AuthBar";

type Props = {
  onUserChange?: (u: { email: string | null } | null) => void;
};

export function TopNav({ onUserChange }: Props) {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        {/* 左：logo */}
        <Link href="/" className="logo">
          QuickMeet
        </Link>

        {/* 中：导航链接 */}
        <nav className="nav-links">
          <Link href="/inbox" className="nav-link">
            Inbox
          </Link>
          <Link href="/sent" className="nav-link">
            Sent
          </Link>
        </nav>

        {/* 右：登录区 */}
        <div className="nav-auth">
          <AuthBar onUserChange={onUserChange} />
        </div>
      </div>
    </header>
  );
}

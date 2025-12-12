"use client";

import Link from "next/link";
import { AuthBar } from "./AuthBar";

type AuthedUser = {
  id: string;
  email: string | null;
};

type Props = {
  onUserChange?: (u: AuthedUser | null) => void;
};

export function TopNav({ onUserChange }: Props) {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        {/* 左：logo */}
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          <span className="logo-word">LetterMeet</span>
        </Link>

        {/* 中：导航 */}
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

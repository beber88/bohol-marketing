"use client";

import { useState, useEffect } from "react";

const COOKIE_NAME = "ppv-dashboard-auth";
const PASSWORD = "BlueEverest2026!";

export function DashboardAuth({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_NAME);
    if (saved === btoa(PASSWORD)) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem(COOKIE_NAME, btoa(PASSWORD));
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4E85BF] border-t-transparent" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] px-4" dir="rtl">
        <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-[#334155] p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[#89AACC] to-[#4E85BF] flex items-center justify-center">
            <span className="text-sm font-bold text-white">PV</span>
          </div>
          <h1 className="text-lg font-semibold text-[#F1F5F9] mb-1">Panglao Prime Villas</h1>
          <p className="text-sm text-[#94A3B8] mb-6">Marketing Dashboard</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="סיסמה"
              autoFocus
              className="w-full rounded-xl border border-[#475569] bg-[#0F172A] px-4 py-3 text-center text-[#E2E8F0] text-base tracking-widest placeholder-[#64748B] outline-none focus:border-[#4E85BF] focus:ring-2 focus:ring-[#4E85BF]/20 mb-3"
            />
            {error && <p className="text-sm text-red-400 mb-3">סיסמה שגויה</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-[#89AACC] to-[#4E85BF] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              כניסה
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

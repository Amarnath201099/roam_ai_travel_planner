"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiCompass, FiLayers } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-brand-card/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-wide text-brand-white"
        >
          <FiCompass className="text-brand-accent text-2xl" />
          Roam<span className="text-brand-accent">AI</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-brand-accent transition-colors flex items-center gap-1"
              >
                <FiLayers /> Dashboard
              </Link>
              <div className="h-4 w-[1px] bg-slate-700" />
              <span className="text-sm text-brand-muted">
                Hello, {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-800 border border-slate-700 hover:bg-red-950/30 hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-brand-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-brand-accent text-brand-dark rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

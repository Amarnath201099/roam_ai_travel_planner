"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { FiLogOut, FiCompass, FiLayers } from "react-icons/fi";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();

  return (
    <nav className="bg-brand-card/90 backdrop-blur-md border-b border-brand-border sticky top-0 z-50 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-wide text-brand-text"
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
              <div className="h-4 w-[1px] bg-brand-border" />
              <span className="text-sm text-brand-muted">
                Hello, {user.name}
              </span>
              <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-brand-bg border border-brand-border text-brand-text text-sm rounded-lg px-2 py-1 outline-none focus:border-brand-accent cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border border-brand-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer text-brand-text"
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
                className="px-4 py-2 bg-brand-accent text-white rounded-xl font-semibold text-sm hover:bg-brand-hover transition-colors shadow-sm"
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

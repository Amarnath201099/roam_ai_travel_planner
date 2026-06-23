"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import {
  FiLogOut,
  FiCompass,
  FiLayers,
  FiMenu,
  FiX,
  FiPieChart,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn = !!user?._id;
  // Helper to determine if a link is active for the thin underline styling
  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };
  // console.log(isActive);

  const activeLinkStyle =
    "text-brand-accent border-b-2 border-brand-accent font-bold pb-1";
  const inactiveLinkStyle =
    "text-brand-muted hover:text-brand-accent border-b-2 border-transparent font-medium pb-1 transition-all";

  return (
    <nav className="bg-brand-card/90 backdrop-blur-md border-b border-brand-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-wide text-brand-text"
        >
          <FiCompass className="text-brand-accent text-2xl" />
          Roam<span className="text-brand-accent">AI</span>
        </Link>

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:flex items-center gap-6">
          {loading ? (
            <div className="h-8 w-24 bg-brand-border animate-pulse rounded-lg"></div>
          ) : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1 text-sm ${isActive("/dashboard") ? activeLinkStyle : inactiveLinkStyle}`}
              >
                <FiLayers /> Dashboard
              </Link>

              <Link
                href="/expenses"
                className={`flex items-center gap-1 text-sm ${isActive("/expenses") ? activeLinkStyle : inactiveLinkStyle}`}
              >
                <FiPieChart /> Expenses
              </Link>

              <div className="h-4 w-[1px] bg-brand-border" />

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

              {/* Laptop Profile Button */}
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-4 py-1.5 bg-brand-bg/50 border rounded-full hover:bg-brand-bg hover:border-brand-accent transition-all ${
                  isActive("/profile")
                    ? "border-brand-accent shadow-sm"
                    : "border-brand-border"
                }`}
              >
                <span className="text-sm font-medium text-brand-text">
                  {user.name.split(" ")[0]}
                </span>
              </Link>

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
                className={`text-sm ${isActive("/login") ? activeLinkStyle : inactiveLinkStyle}`}
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

        {/* --- MOBILE VIEW (TOP BAR) --- */}
        <div className="flex md:hidden items-center gap-4">
          {user && !loading && (
            <Link
              href="/profile"
              className={`flex items-center justify-center w-8 h-8 rounded-full bg-brand-bg/80 border ${isActive("/profile") ? "border-brand-accent text-brand-accent" : "border-brand-border text-brand-text"} font-bold text-sm shadow-sm`}
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-brand-text p-1 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU (FRAMER MOTION) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-brand-border bg-brand-card overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {loading ? (
                <div className="h-8 w-24 bg-brand-border animate-pulse rounded-lg"></div>
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 text-sm w-max ${isActive("/dashboard") ? activeLinkStyle : inactiveLinkStyle}`}
                  >
                    <FiLayers /> Dashboard
                  </Link>

                  <Link
                    href="/expenses"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 text-sm w-max ${isActive("/expenses") ? activeLinkStyle : inactiveLinkStyle}`}
                  >
                    <FiPieChart /> Expenses
                  </Link>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-brand-muted uppercase">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => changeCurrency(e.target.value)}
                      className="bg-brand-bg border border-brand-border text-brand-text text-sm rounded-lg px-3 py-2 outline-none focus:border-brand-accent w-full"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all w-full font-bold shadow-sm"
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 text-sm font-medium text-brand-text border border-brand-border rounded-xl hover:bg-brand-bg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 bg-brand-accent text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-brand-hover transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

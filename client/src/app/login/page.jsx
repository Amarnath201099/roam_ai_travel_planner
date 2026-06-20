"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.message || "Authentication credentials rejected.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-brand-card rounded-2xl border border-brand-border shadow-lg">
      <h2 className="text-3xl font-extrabold text-brand-text tracking-tight mb-2">
        Welcome Back
      </h2>
      <p className="text-brand-muted text-sm mb-6">
        Log in to manage your personalized AI itineraries.
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none text-brand-text text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none text-brand-text text-sm transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-brand-muted">
        New to the platform?{" "}
        <Link
          href="/register"
          className="text-brand-accent hover:underline font-medium"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

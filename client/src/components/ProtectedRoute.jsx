"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  // We assume your AuthContext exposes 'user' and a 'loading' state.
  // Adjust these variable names if your context uses different ones (e.g., isAuthenticated)
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth finishes loading and there is no user, kick them to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show a loading state while checking authentication to prevent UI flashing
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  // If there is no user, return null so the protected content doesn't flash before the redirect happens
  if (!user) {
    return null;
  }

  // If user is authenticated, render the page normally
  return <>{children}</>;
}

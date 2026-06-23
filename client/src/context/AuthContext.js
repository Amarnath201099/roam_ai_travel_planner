"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log(user);
  useEffect(() => {
    // Rehydrate authentication state by checking if the httpOnly cookie is valid
    const checkUserSession = async () => {
      try {
        // Our API interceptor automatically sends the cookie with this request
        const { data } = await API.get("/auth/profile");
        // UPDATE: Store the complete user object instead of just name and email
        setUser(data?._id ? data : null);
      } catch (error) {
        // If it fails (e.g., 401 Unauthorized, cookie expired or missing), we remain unauthenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    // UPDATE: Store the complete user object
    setUser(data);
    router.push("/dashboard");
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
    });
    // UPDATE: Store the complete user object
    setUser(data);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      // Tell backend to destroy the cookie
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear React state and redirect
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

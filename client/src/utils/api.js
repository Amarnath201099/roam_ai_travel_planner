import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Allows httpOnly cookies
});

// Response Interceptor: Handle global 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Define public routes where a 401 is expected and shouldn't trigger a redirect
        const isPublicRoute =
          currentPath === "/login" ||
          currentPath === "/register" ||
          currentPath === "/";

        // Only force redirect if they are in a protected area (like /dashboard)
        if (!isPublicRoute) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default API;

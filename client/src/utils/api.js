import axios from "axios";

// Create a configured Axios instance
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request Interceptor: Automatically attach the JWT token if it exists
API.interceptors.request.use(
  (config) => {
    // We only access localStorage on the client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle global 401 Unauthorized errors (e.g., token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Force redirect to login page if token fails
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;

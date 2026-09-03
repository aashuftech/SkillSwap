/**
 * Dynamic API Base URL resolver.
 * - In local development on localhost/127.0.0.1 -> http://localhost:4000
 * - In production deployment on Render / Vercel -> window.location.origin (or configured VITE_API_BASE_URL)
 */
export const getApiUrl = () => {
  if (typeof window === "undefined") {
    return process.env.VITE_API_BASE_URL || "http://localhost:4000";
  }

  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

  if (!isLocal) {
    // If running on production (e.g. *.onrender.com or custom domain), use same origin
    return window.location.origin;
  }

  return import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
};

export const API = getApiUrl();

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function forceLogout(message) {
  const hadToken = Boolean(localStorage.getItem("authToken"));
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("skillswapUser");
  window.dispatchEvent(new Event("authChange"));
  if (hadToken && message) {
    sessionStorage.setItem("skillswapLogoutReason", message);
  }
  if (hadToken && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    window.location.href = "/login";
  }
}

/**
 * fetch() wrapper for authenticated requests. If the server says the
 * session is gone (401) or the account has been banned (403 code:BANNED),
 * this clears local auth state only if a token was present.
 */
export async function authFetch(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (token && (response.status === 401 || response.status === 403)) {
    let data = {};
    try {
      data = await response.clone().json();
    } catch {
      /* non-JSON error body */
    }
    if (response.status === 401 || data.code === "BANNED") {
      forceLogout(data.message || "Your session has expired. Please log in again.");
    }
  }

  return response;
}

export { API };


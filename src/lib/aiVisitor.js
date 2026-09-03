const VISITOR_KEY = "skillswapAiVisitorId";

export function getAiVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }
  return visitorId;
}

export function aiHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

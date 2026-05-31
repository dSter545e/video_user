const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const VISITOR_ID_KEY = "visitor_id";
export const SESSION_ID_KEY = "visitor_session_id";
export const TAB_ID_KEY = "visitor_tab_id";
const TAB_PING_PREFIX = "visitor_tab_ping_";

const randomId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;

export const getOrCreateVisitorId = () => {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const next = randomId("visitor");
  localStorage.setItem(VISITOR_ID_KEY, next);
  return next;
};

export const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return "";
  const existing = sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const next = randomId("session");
  sessionStorage.setItem(SESSION_ID_KEY, next);
  return next;
};

export const getOrCreateTabId = () => {
  if (typeof window === "undefined") return "";
  const existing = sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;
  const next = randomId("tab");
  sessionStorage.setItem(TAB_ID_KEY, next);
  return next;
};

export const getActiveTabCount = () => {
  if (typeof window === "undefined") return 1;
  const now = Date.now();
  const thresholdMs = 15_000;
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(TAB_PING_PREFIX));
  let count = 0;
  for (const key of keys) {
    const ts = Number(localStorage.getItem(key) || 0);
    if (now - ts <= thresholdMs) {
      count += 1;
    } else {
      localStorage.removeItem(key);
    }
  }
  return Math.max(1, count);
};

export const pingTab = (tabId: string) => {
  if (typeof window === "undefined") return 1;
  localStorage.setItem(`${TAB_PING_PREFIX}${tabId}`, String(Date.now()));
  return getActiveTabCount();
};

export const removeTabPing = (tabId: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${TAB_PING_PREFIX}${tabId}`);
};

export const postAnalytics = async (endpoint: string, body: Record<string, unknown>, keepalive = false) => {
  try {
    await fetch(`${API_URL}/api/analytics${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive,
    });
  } catch (_error) {
    // ignore telemetry failures
  }
};

export const emitAnalyticsEvent = (eventType: string, metadata: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("app-analytics-event", {
      detail: {
        eventType,
        metadata,
      },
    })
  );
};

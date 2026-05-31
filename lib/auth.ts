export type ViewerUser = {
  id: string;
  name: string;
  email: string;
};

const USER_KEY = "viewer_user";
const TOKEN_KEY = "viewer_token";
export const VIEWER_AUTH_CHANGED_EVENT = "viewer_auth_changed";

const emitViewerAuthChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(VIEWER_AUTH_CHANGED_EVENT));
};

export const getViewerToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
};

export const getViewerUser = (): ViewerUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const saveViewerSession = (token: string, user: ViewerUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitViewerAuthChanged();
};

export const updateViewerUser = (user: ViewerUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitViewerAuthChanged();
};

export const clearViewerSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emitViewerAuthChanged();
};

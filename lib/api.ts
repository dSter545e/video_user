import { Category, CategoryVideo, PaginatedVideosResponse, UserAuthResponse, Video, VideoComment } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getVideosApi(): Promise<Video[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos`, { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function getPaginatedVideosApi(params: {
  page?: number;
  limit?: number;
  sort?: "recent" | "most_viewed" | "top_rated" | "long_duration" | "short_duration";
}): Promise<PaginatedVideosResponse> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 20);
  const sort = params.sort || "recent";
  const query = new URLSearchParams({
    paginate: "1",
    page: String(page),
    limit: String(limit),
    sort,
  });
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos?${query.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      return {
        items: [],
        pagination: { page, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }
    return response.json();
  } catch (_error) {
    return {
      items: [],
      pagination: { page, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };
  }
}

export async function getRecommendedVideosApi(params: {
  visitorId?: string;
  currentVideoId?: string;
  limit?: number;
}): Promise<Video[]> {
  const query = new URLSearchParams();
  if (params.visitorId) query.set("visitorId", params.visitorId);
  if (params.currentVideoId) query.set("currentVideoId", params.currentVideoId);
  if (params.limit) query.set("limit", String(params.limit));
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos/recommended?${query.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function getCategoriesApi(): Promise<Category[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories`, { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function getVideosByCategoryApi(categoryId: string): Promise<CategoryVideo[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos?categoryId=${categoryId}`, { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function getVideoByIdApi(id: string, userIdentifier?: string): Promise<Video | null> {
  try {
    const suffix = userIdentifier ? `?userIdentifier=${encodeURIComponent(userIdentifier)}` : "";
    const response = await fetch(`${BACKEND_URL}/api/videos/${id}${suffix}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch (_error) {
    return null;
  }
}

export async function trackVideoViewApi(id: string, userIdentifier: string, watchedSeconds: number) {
  const response = await fetch(`${BACKEND_URL}/api/videos/${id}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIdentifier, watchedSeconds }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function reactToVideoApi(id: string, userIdentifier: string, reaction: "like" | "dislike") {
  const response = await fetch(`${BACKEND_URL}/api/videos/${id}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIdentifier, reaction }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function getVideoCommentsApi(id: string): Promise<VideoComment[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos/${id}/comments`, { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function addVideoCommentApi(id: string, payload: { userIdentifier: string; authorName: string; message: string }) {
  const response = await fetch(`${BACKEND_URL}/api/videos/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function setVideoTagsApi(id: string, tags: string[]) {
  const response = await fetch(`${BACKEND_URL}/api/videos/${id}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function signupUserApi(payload: { name: string; email: string; password: string }): Promise<UserAuthResponse> {
  const response = await fetch(`${BACKEND_URL}/api/user-auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Signup failed");
  return data;
}

export async function loginUserApi(payload: { email: string; password: string }): Promise<UserAuthResponse> {
  const response = await fetch(`${BACKEND_URL}/api/user-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string; resetToken?: string }> {
  const response = await fetch(`${BACKEND_URL}/api/user-auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function resetPasswordApi(payload: {
  token: string;
  oldPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/user-auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${payload.token}`,
    },
    body: JSON.stringify({
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Reset password failed");
  return data;
}

export async function suggestVideoTagsApi(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos/tags/suggest?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    if (!response.ok) return [];
    const data: Array<{ displayName: string }> = await response.json();
    return data.map((item) => item.displayName);
  } catch (_error) {
    return [];
  }
}

export async function submitVideoRemovalRequestApi(payload: {
  videoId?: string;
  videoUrl?: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  additionalInfo?: string;
}) {
  const response = await fetch(`${BACKEND_URL}/api/removal-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to submit removal request");
  return data;
}

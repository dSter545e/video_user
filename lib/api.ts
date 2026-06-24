import { Category, CategoryVideo, PaginatedVideosResponse, UserAuthResponse, Video, VideoComment } from "./types";
import { getPublicApiUrl } from "./apiConfig";
import { dynamicFetchInit, publicFetchInit } from "./fetchConfig";
import { logApiVideoFetch } from "./mediaDebug";
import { normalizeVideoList, normalizeVideoMedia } from "./mediaUrl";

/** Always the public backend origin so API media URLs use the correct host. */
const BACKEND_URL = getPublicApiUrl();

export async function getVideosApi(): Promise<Video[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos`, publicFetchInit());
    if (!response.ok) return [];
    return normalizeVideoList(await response.json());
  } catch (_error) {
    return [];
  }
}

export async function getPaginatedVideosApi(params: {
  page?: number;
  limit?: number;
  sort?: "recent" | "most_viewed" | "top_rated" | "long_duration" | "short_duration";
  q?: string;
  categoryId?: string;
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
  if (params.q?.trim()) {
    query.set("q", params.q.trim());
  }
  if (params.categoryId?.trim()) {
    query.set("categoryId", params.categoryId.trim());
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos?${query.toString()}`, publicFetchInit());
    if (!response.ok) {
      return {
        items: [],
        pagination: { page, limit, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
    }
    const data = await response.json();
    return {
      ...data,
      items: normalizeVideoList(data.items || []),
    };
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
    const response = await fetch(`${BACKEND_URL}/api/videos/recommended?${query.toString()}`, publicFetchInit(30));
    if (!response.ok) return [];
    return normalizeVideoList(await response.json());
  } catch (_error) {
    return [];
  }
}

export async function getCategoriesApi(): Promise<Category[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories`, publicFetchInit());
    if (!response.ok) return [];
    return response.json();
  } catch (_error) {
    return [];
  }
}

export async function getVideosByCategoryApi(categoryId: string): Promise<CategoryVideo[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos?categoryId=${categoryId}`, publicFetchInit());
    if (!response.ok) return [];
    return normalizeVideoList(await response.json());
  } catch (_error) {
    return [];
  }
}

export async function getVideoByIdRawApi(id: string, userIdentifier?: string): Promise<Video | null> {
  try {
    const suffix = userIdentifier ? `?userIdentifier=${encodeURIComponent(userIdentifier)}` : "";
    const endpoint = `/api/videos/${id}${suffix}`;
    const response = await fetch(`${BACKEND_URL}${endpoint}`, publicFetchInit(30));
    if (!response.ok) return null;
    const raw = (await response.json()) as Video;
    logApiVideoFetch(endpoint, raw);
    return raw;
  } catch (_error) {
    return null;
  }
}

export async function getVideoByIdApi(id: string, userIdentifier?: string): Promise<Video | null> {
  const raw = await getVideoByIdRawApi(id, userIdentifier);
  return raw ? normalizeVideoMedia(raw) : null;
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

export async function getVideosByIdsApi(ids: string[]): Promise<Video[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean))).slice(0, 24);
  if (!uniqueIds.length) return [];

  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/videos/${id}`, dynamicFetchInit());
        if (!response.ok) return null;
        return normalizeVideoMedia(await response.json());
      } catch (_error) {
        return null;
      }
    })
  );

  return results.filter(Boolean) as Video[];
}

export async function getVideoCommentsApi(id: string): Promise<VideoComment[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/videos/${id}/comments`, publicFetchInit(15));
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

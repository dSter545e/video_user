export type Video = {
  _id: string;
  videoId?: string;
  slug?: string;
  title: string;
  description: string;
  thumbnail: string;
  previewUrl?: string;
  videoUrl: string;
  duration?: string;
  durationSeconds?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  createdAt?: string;
  qualityVariants?: Array<{
    label: string;
    height: number;
    width?: number;
    url: string;
    key?: string;
  }>;
  processingStatus?: "public" | "private" | "processing" | "draft" | "active" | "inactive" | "ready";
  viewsCount?: number;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  userReaction?: "like" | "dislike" | null;
  tags?: VideoTag[];
  recommendedVideos?: Video[];
  category?: {
    _id: string;
    name: string;
    imageUrl: string;
  } | null;
};

export type VideoTag = {
  _id: string;
  name: string;
  displayName: string;
};

export type VideoComment = {
  _id: string;
  video: string;
  userIdentifier?: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export type UserAuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type Category = {
  _id: string;
  slug?: string;
  name: string;
  imageUrl: string;
  featured?: boolean;
};

export type CategoryVideo = Video;

export type PaginatedVideosResponse = {
  items: Video[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type VideoRemovalRequest = {
  _id: string;
  video?: {
    _id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
  } | null;
  videoTitle?: string;
  videoReference?: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  additionalInfo?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  videoDeleted?: boolean;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

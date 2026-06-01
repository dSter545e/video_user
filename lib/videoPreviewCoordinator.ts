export const VIDEO_PREVIEW_CLAIM_EVENT = "video-preview-claim";

export type VideoPreviewClaimDetail = {
  ownerId: string;
};

/** Tell all video cards that this id owns the only active preview. */
export const claimVideoPreview = (ownerId: string) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<VideoPreviewClaimDetail>(VIDEO_PREVIEW_CLAIM_EVENT, {
      detail: { ownerId },
    })
  );
};

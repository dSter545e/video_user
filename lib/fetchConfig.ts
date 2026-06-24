/** ISR window for public catalog pages (seconds). */
export const PUBLIC_REVALIDATE_SECONDS = 60;

export const publicFetchInit = (revalidate = PUBLIC_REVALIDATE_SECONDS): RequestInit => {
  if (typeof window !== "undefined") {
    return { cache: "no-store" };
  }
  return { next: { revalidate } };
};

export const dynamicFetchInit = (): RequestInit => ({ cache: "no-store" });

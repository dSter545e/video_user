import videojs from "video.js";
import { normalizeMediaUrl } from "./mediaUrl";

export type PlayerSource = {
  src: string;
  label?: string;
  height?: number;
};

type VhsXhrOptions = { uri?: string };
type VhsXhr = { onRequest?: (options: VhsXhrOptions) => VhsXhrOptions | void };

let vhsHookInstalled = false;

/** Rewrite nested HLS playlist/segment URLs to the media API host. */
export const installVhsMediaHook = () => {
  if (vhsHookInstalled || typeof window === "undefined") return;

  const xhr = (videojs as typeof videojs & { Vhs?: { xhr?: VhsXhr } }).Vhs?.xhr;
  if (!xhr?.onRequest) return;

  const previous = xhr.onRequest;
  xhr.onRequest = (options) => {
    const next = previous(options) || options;
    if (next.uri) next.uri = normalizeMediaUrl(next.uri);
    return next;
  };

  vhsHookInstalled = true;
};

const isHls = (url: string) => url.endsWith(".m3u8");

export const getPlayerMimeType = (url: string) =>
  isHls(url) ? "application/x-mpegURL" : "video/mp4";

const isSlowNetwork = () => {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
  if (!conn) return false;
  if (conn.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return true;
  return typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 1.5;
};

export const buildQualityOptions = (src: string, variants: PlayerSource[] = []): PlayerSource[] => {
  const map = new Map<string, PlayerSource>();
  const main = normalizeMediaUrl(src);

  for (const item of variants) {
    if (!item?.src) continue;
    const normalized = normalizeMediaUrl(item.src);
    map.set(normalized, { ...item, src: normalized });
  }

  if (main) {
    map.set(main, map.get(main) || { src: main, label: "Source", height: 0 });
  }

  return Array.from(map.values()).sort((a, b) => (a.height || 0) - (b.height || 0));
};

export const buildPlayerSources = (
  src: string,
  variants: PlayerSource[] = [],
  selected: string = "auto"
): Array<{ src: string; type: string }> => {
  const main = normalizeMediaUrl(src);
  if (!main) return [];

  if (isHls(main)) {
    return [{ src: main, type: getPlayerMimeType(main) }];
  }

  const options = buildQualityOptions(main, variants);
  if (!options.length) return [];

  const byHeight = [...options].sort((a, b) => (a.height || 0) - (b.height || 0));
  const preferred =
    selected !== "auto"
      ? options.find((o) => o.src === normalizeMediaUrl(selected)) || byHeight[byHeight.length - 1]
      : isSlowNetwork()
        ? byHeight.find((o) => (o.height || 0) > 0 && (o.height || 0) <= 360) || byHeight[0]
        : byHeight[byHeight.length - 1];

  const ordered = [preferred, ...options.filter((o) => o.src !== preferred.src)];
  return ordered.map((item) => ({ src: item.src, type: getPlayerMimeType(item.src) }));
};

import videojs from "video.js";
import { normalizeMediaUrl } from "./mediaUrl";

export type PlayerSource = {
  src: string;
  label?: string;
  height?: number;
};

type VhsXhrOptions = { uri?: string };
type VhsXhr = {
  beforeRequest?: (options: VhsXhrOptions) => VhsXhrOptions | void;
  onRequest?: (options: VhsXhrOptions) => VhsXhrOptions | void;
};

let vhsHookInstalled = false;

const rewriteVhsUri = (options: VhsXhrOptions) => {
  if (options?.uri) options.uri = normalizeMediaUrl(options.uri);
  return options;
};

/** Rewrite every HLS playlist/segment request (including URLs embedded inside .m3u8). */
export const installVhsMediaHook = () => {
  if (vhsHookInstalled || typeof window === "undefined") return;

  const xhr = (videojs as typeof videojs & { Vhs?: { xhr?: VhsXhr } }).Vhs?.xhr;
  if (!xhr) return;

  const chain =
    (previous?: (options: VhsXhrOptions) => VhsXhrOptions | void) =>
    (options: VhsXhrOptions) =>
      rewriteVhsUri(previous ? previous(options) || options : options);

  if (typeof xhr.onRequest === "function") {
    xhr.onRequest = chain(xhr.onRequest);
  } else {
    xhr.beforeRequest = chain(xhr.beforeRequest);
  }

  vhsHookInstalled = true;
};

const isHls = (url: string) => /\.m3u8(\?|$)/i.test(url);

export const getPlayerMimeType = (url: string) =>
  isHls(url) ? "application/x-mpegURL" : "video/mp4";

type NetworkTier = "slow" | "good" | "unknown";

type NavigatorConnection = {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
};

const readConnection = (): NavigatorConnection | null => {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { connection?: NavigatorConnection }).connection ?? null;
};

/** Classify connection for adaptive quality (HLS + progressive fallback). */
export const getNetworkTier = (): NetworkTier => {
  const conn = readConnection();
  if (!conn) return "unknown";
  if (conn.saveData) return "slow";

  if (conn.effectiveType) {
    if (["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return "slow";
    if (conn.effectiveType === "4g") return "good";
  }

  if (typeof conn.downlink === "number" && conn.downlink > 0) {
    if (conn.downlink < 1.5) return "slow";
    if (conn.downlink >= 2) return "good";
  }

  return "unknown";
};

export const isSlowNetwork = () => getNetworkTier() === "slow";

const megabitsToBitsPerSecond = (mbps: number) => Math.round(mbps * 1_000_000);

/**
 * Video.js VHS (HLS) options tuned for quality on good connections.
 * Slow networks still start low to avoid rebuffering.
 */
export const getVhsPlaybackOptions = () => {
  const tier = getNetworkTier();
  const conn = readConnection();
  const slow = tier === "slow";
  const preferHighQuality = !slow;

  let bandwidth: number | undefined;
  if (conn?.downlink && conn.downlink > 0) {
    bandwidth = megabitsToBitsPerSecond(conn.downlink * (slow ? 0.7 : 0.95));
  } else if (preferHighQuality) {
    bandwidth = megabitsToBitsPerSecond(8);
  } else {
    bandwidth = megabitsToBitsPerSecond(1);
  }

  return {
    withCredentials: false,
    enableLowInitialPlaylist: slow,
    limitRenditionByPlayerDimensions: slow,
    useBandwidthFromLocalStorage: true,
    bandwidth,
  };
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

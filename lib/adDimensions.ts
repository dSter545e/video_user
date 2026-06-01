const pickDimension = (html: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const value = Number.parseInt(match[1], 10);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return undefined;
};

/** Best-effort parse of common ad embed width/height (e.g. 728x90, 300x250). */
export const parseAdDimensionsFromHtml = (html: string) => {
  const pair = html.match(/\b(\d{2,4})\s*[x×]\s*(\d{2,4})\b/i);
  if (pair) {
    return {
      width: Number.parseInt(pair[1], 10),
      height: Number.parseInt(pair[2], 10),
    };
  }

  const width = pickDimension(html, [
    /\bdata-ad-width=['"]?(\d+)/i,
    /\bdata-width=['"]?(\d+)/i,
    /\bwidth=['"]?(\d{2,4})\b/i,
    /style=['"][^'"]*width:\s*(\d{2,4})px/i,
  ]);

  const height = pickDimension(html, [
    /\bdata-ad-height=['"]?(\d+)/i,
    /\bdata-height=['"]?(\d+)/i,
    /\bheight=['"]?(\d{2,4})\b/i,
    /style=['"][^'"]*height:\s*(\d{2,4})px/i,
  ]);

  return { width, height };
};

export const DEFAULT_BANNER_WIDTH = 728;
export const DEFAULT_BANNER_HEIGHT = 90;

export const resolveAdDimensions = (width?: number, height?: number) => ({
  width: width && width > 0 ? width : DEFAULT_BANNER_WIDTH,
  height: height && height > 0 ? height : DEFAULT_BANNER_HEIGHT,
});

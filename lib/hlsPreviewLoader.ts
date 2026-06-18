type HlsConstructor = typeof import("hls.js").default;

let hlsModulePromise: Promise<HlsConstructor> | null = null;

/** Load hls.js once so the first card hover does not wait on a dynamic import. */
export const preloadHlsModule = (): Promise<HlsConstructor> => {
  if (!hlsModulePromise) {
    hlsModulePromise = import("hls.js").then((module) => module.default);
  }
  return hlsModulePromise;
};

export const getHlsModule = () => preloadHlsModule();

export type { HlsConstructor };

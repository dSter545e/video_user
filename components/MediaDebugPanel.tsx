"use client";

import { useEffect, useMemo, useState } from "react";
import { Video } from "../lib/types";
import {
  buildMediaDebugSnapshot,
  isMediaDebugEnabled,
  logMediaDebug,
  probeMediaUrl,
  type MediaProbeResult,
} from "../lib/mediaDebug";

type MediaDebugPanelProps = {
  video: Video;
  rawVideo: Video;
  playbackSrc: string;
};

export default function MediaDebugPanel({ video, rawVideo, playbackSrc }: MediaDebugPanelProps) {
  const [open, setOpen] = useState(true);
  const [probe, setProbe] = useState<MediaProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  const snapshot = useMemo(
    () => buildMediaDebugSnapshot(video, playbackSrc, rawVideo),
    [video, rawVideo, playbackSrc]
  );

  useEffect(() => {
    if (!isMediaDebugEnabled()) return;
    logMediaDebug("watch page", snapshot);
  }, [snapshot]);

  if (!isMediaDebugEnabled()) return null;

  const runProbe = async () => {
    setProbing(true);
    try {
      const result = await probeMediaUrl(playbackSrc);
      setProbe(result);
      console.log("[media-debug] probe result", result);
    } finally {
      setProbing(false);
    }
  };

  return (
    <section className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-[var(--foreground)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-amber-700 dark:text-amber-300">Media debug (local only)</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-amber-600/40 px-2 py-1 font-semibold"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            className="rounded border border-amber-600/40 px-2 py-1 font-semibold"
            onClick={() => void runProbe()}
            disabled={probing || !playbackSrc}
          >
            {probing ? "Probing…" : "Probe playback URL"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-3 space-y-3">
          <dl className="grid gap-1 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">NEXT_PUBLIC_API_URL</dt>
              <dd className="break-all font-mono">{snapshot.configuredApiUrl}</dd>
            </div>
            <div>
              <dt className="font-semibold">NEXT_PUBLIC_SITE_URL</dt>
              <dd className="break-all font-mono">{snapshot.configuredSiteUrl}</dd>
            </div>
            <div>
              <dt className="font-semibold">meta api-base-url</dt>
              <dd className="break-all font-mono">{snapshot.metaApiUrl || "(missing)"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Resolved API origin</dt>
              <dd className="break-all font-mono">{snapshot.resolvedApiOrigin || "(none)"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Page origin</dt>
              <dd className="break-all font-mono">{snapshot.pageOrigin}</dd>
            </div>
            <div>
              <dt className="font-semibold">Playback src</dt>
              <dd className="break-all font-mono">{playbackSrc || "(empty)"}</dd>
            </div>
          </dl>

          {snapshot.issues.length ? (
            <div className="rounded border border-red-500/40 bg-red-500/10 p-2">
              <p className="font-semibold text-red-700 dark:text-red-300">Issues</p>
              <ul className="mt-1 list-disc pl-4">
                {snapshot.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-emerald-700 dark:text-emerald-300">No URL host issues detected.</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-amber-600/30">
                  <th className="p-1">Field</th>
                  <th className="p-1">Host</th>
                  <th className="p-1">API?</th>
                  <th className="p-1">Site?</th>
                  <th className="p-1">Changed</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.urlChecks.map((check) => (
                  <tr key={check.label} className="border-b border-amber-600/20 align-top">
                    <td className="p-1 font-semibold">{check.label}</td>
                    <td className="p-1 font-mono">{check.host}</td>
                    <td className="p-1">{check.pointsAtApi ? "yes" : "no"}</td>
                    <td className="p-1">{check.pointsAtSite ? "yes" : "no"}</td>
                    <td className="p-1">{check.changed ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {probe ? (
            <div className="rounded border border-amber-600/30 bg-black/20 p-2 font-mono">
              <p>
                Probe: {probe.ok ? "OK" : "FAILED"} — {probe.status} {probe.statusText}
              </p>
              <p className="break-all">{probe.url}</p>
              {probe.contentType ? <p>Content-Type: {probe.contentType}</p> : null}
              {probe.error ? <p className="text-red-400">{probe.error}</p> : null}
              {probe.preview ? (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{probe.preview}</pre>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

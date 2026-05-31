"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { submitVideoRemovalRequestApi } from "../../lib/api";

function ReportRemovalForm() {
  const searchParams = useSearchParams();
  const initialVideoRef = searchParams.get("video") || searchParams.get("videoUrl") || "";

  const [videoReference, setVideoReference] = useState(initialVideoRef);
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await submitVideoRemovalRequestApi({
        videoUrl: videoReference.trim(),
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim(),
        reason: reason.trim(),
        additionalInfo: additionalInfo.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="yt-card p-6 text-center sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--brand)]">Request Submitted</h1>
        <p className="yt-muted mt-3 text-sm">
          Your video removal request has been received. Our team will review it and take appropriate action.
        </p>
        <Link href="/" className="yt-link mt-6 inline-block text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Video Removal Request</h1>
        <p className="yt-muted mt-2 text-sm">
          Use this form to request removal of a video. Provide the video link or ID and explain your reason.
        </p>
      </div>

      <form onSubmit={onSubmit} className="yt-card space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="videoReference" className="mb-1 block text-sm font-semibold">
            Video URL or ID
          </label>
          <input
            id="videoReference"
            className="yt-input w-full rounded px-3 py-2 text-sm"
            placeholder="https://yoursite.com/videos/example or video slug"
            value={videoReference}
            onChange={(event) => setVideoReference(event.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="requesterName" className="mb-1 block text-sm font-semibold">
              Your Name
            </label>
            <input
              id="requesterName"
              className="yt-input w-full rounded px-3 py-2 text-sm"
              placeholder="Full name"
              value={requesterName}
              onChange={(event) => setRequesterName(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="requesterEmail" className="mb-1 block text-sm font-semibold">
              Email Address
            </label>
            <input
              id="requesterEmail"
              type="email"
              className="yt-input w-full rounded px-3 py-2 text-sm"
              placeholder="you@example.com"
              value={requesterEmail}
              onChange={(event) => setRequesterEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="mb-1 block text-sm font-semibold">
            Reason for Removal
          </label>
          <textarea
            id="reason"
            className="yt-input min-h-[120px] w-full rounded px-3 py-2 text-sm"
            placeholder="Explain why this video should be removed..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="additionalInfo" className="mb-1 block text-sm font-semibold">
            Additional Details (optional)
          </label>
          <textarea
            id="additionalInfo"
            className="yt-input min-h-[90px] w-full rounded px-3 py-2 text-sm"
            placeholder="Any extra information that may help us review your request..."
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
          />
        </div>

        <button
          className="w-full rounded bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Submitting..." : "Submit Removal Request"}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </>
  );
}

export default function ReportRemovalClient() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Suspense fallback={<p className="yt-muted text-sm">Loading form...</p>}>
        <ReportRemovalForm />
      </Suspense>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { resetPasswordApi } from "../../../lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (!oldPassword) {
      setError("Old password is required.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordApi({
        token,
        oldPassword,
        newPassword,
      });
      setMessage(data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <form onSubmit={onSubmit} className="yt-card space-y-3 p-5">
        <h1 className="text-xl font-bold">Change Password</h1>
        <p className="yt-muted text-sm">Enter your current password and set a new one.</p>
        <input
          type="password"
          className="yt-input w-full rounded px-3 py-2"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          className="yt-input w-full rounded px-3 py-2"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          className="yt-input w-full rounded px-3 py-2"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="yt-card w-full px-4 py-2" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Change Password"}
        </button>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link href="/dashboard" className="yt-link text-sm">
          Back to Dashboard
        </Link>
      </form>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { forgotPasswordApi } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await forgotPasswordApi(email);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <form onSubmit={onSubmit} className="yt-card space-y-3 p-5">
        <h1 className="text-xl font-bold">Forgot Password</h1>
        <input className="yt-input w-full rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="yt-card w-full px-4 py-2" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Submit"}
        </button>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link href="/auth/login" className="yt-link text-sm">Back to login</Link>
      </form>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signupUserApi } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
import { saveViewerSession } from "../../../lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);
    try {
      const data = await signupUserApi({ name, email, password });
      saveViewerSession(data.token, data.user);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
        <h1 className="text-xl font-bold">Create Account</h1>
        <input className="yt-input w-full rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="yt-input w-full rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="relative">
          <input
            className="yt-input w-full rounded px-3 py-2 pr-16"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs yt-muted hover:bg-[var(--surface-muted)]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button className="yt-card w-full px-4 py-2" disabled={loading} type="submit">
          {loading ? "Creating..." : "Sign Up"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link href="/auth/login" className="yt-link text-sm">Already have account? Login</Link>
      </form>
    </main>
  );
}

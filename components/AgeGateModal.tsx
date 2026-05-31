"use client";

import { useEffect, useState } from "react";

const AGE_GATE_COOKIE = "xhub4u_age_gate";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const cookieParts = document.cookie.split(";").map((part) => part.trim());
  const match = cookieParts.find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] || "") : "";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export default function AgeGateModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existingValue = getCookie(AGE_GATE_COOKIE);
    if (!existingValue) {
      setVisible(true);
      return;
    }
    if (existingValue === "no") {
      window.location.replace("https://www.google.com");
    }
  }, []);

  const accept = () => {
    setCookie(AGE_GATE_COOKIE, "yes", 60 * 60 * 24 * 365);
    setVisible(false);
  };

  const reject = () => {
    setCookie(AGE_GATE_COOKIE, "no", 60 * 60 * 24 * 365);
    window.location.replace("https://www.google.com");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="yt-card w-full max-w-md rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--brand)]" />
        <h2 className="text-2xl font-bold text-[var(--brand)] uppercase tracking-wide">Warning: Adult Content</h2>
        <p className="mt-4 text-base font-medium">
          This site contains adult material and is restricted to adults only.
        </p>
        <p className="yt-muted mt-2 text-sm">
          Please verify your age to continue. Are you 18 years of age or older?
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="w-full sm:w-auto rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-medium hover:bg-[var(--surface-muted)] transition-colors" onClick={reject}>
            No, I am under 18
          </button>
          <button className="w-full sm:w-auto rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all shadow-md" onClick={accept}>
            Yes, I am 18+
          </button>
        </div>
      </div>
    </div>
  );
}

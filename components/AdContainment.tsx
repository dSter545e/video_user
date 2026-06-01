"use client";

import { ReactNode, useEffect, useRef } from "react";

const MAX_AD_Z_INDEX = 2;

const clampAdDom = (root: HTMLElement) => {
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const computed = window.getComputedStyle(el);
    const position = computed.position;
    const zIndex = Number.parseInt(computed.zIndex, 10);

    if (position === "fixed" || position === "sticky") {
      el.style.setProperty("position", "relative", "important");
      el.style.setProperty("inset", "auto", "important");
      el.style.setProperty("top", "auto", "important");
      el.style.setProperty("right", "auto", "important");
      el.style.setProperty("bottom", "auto", "important");
      el.style.setProperty("left", "auto", "important");
    }

    if (!Number.isNaN(zIndex) && zIndex > MAX_AD_Z_INDEX) {
      el.style.setProperty("z-index", String(MAX_AD_Z_INDEX), "important");
    }
  });
};

type AdContainmentProps = {
  children: ReactNode;
  className?: string;
  slot?: string;
};

export default function AdContainment({ children, className = "", slot }: AdContainmentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const runClamp = () => clampAdDom(root);

    runClamp();
    const observer = new MutationObserver(runClamp);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    const timer = window.setInterval(runClamp, 750);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div ref={rootRef} className={`ad-slot-frame ${className}`.trim()} data-ad-slot={slot}>
      {children}
    </div>
  );
}

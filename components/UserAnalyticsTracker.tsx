"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  emitAnalyticsEvent,
  getActiveTabCount,
  getOrCreateSessionId,
  getOrCreateTabId,
  getOrCreateVisitorId,
  pingTab,
  postAnalytics,
  removeTabPing,
} from "../lib/analytics";

export default function UserAnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef("");
  const sessionIdRef = useRef("");
  const tabIdRef = useRef("");
  const scrollDepthRef = useRef(0);
  const heartbeatStartedAtRef = useRef(Date.now());

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const tabId = getOrCreateTabId();
    visitorIdRef.current = visitorId;
    sessionIdRef.current = sessionId;
    tabIdRef.current = tabId;

    const tabCount = pingTab(tabId);
    void postAnalytics("/session/start", {
      visitorId,
      sessionId,
      path: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      screen: { width: window.screen.width, height: window.screen.height },
      tabCount,
    });

    const pingInterval = window.setInterval(() => {
      pingTab(tabId);
    }, 5000);

    const heartbeatInterval = window.setInterval(() => {
      const activeSeconds = Math.max(1, Math.round((Date.now() - heartbeatStartedAtRef.current) / 1000));
      heartbeatStartedAtRef.current = Date.now();
      const currentTabCount = pingTab(tabId);
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: "heartbeat",
        path: window.location.pathname,
        url: window.location.href,
        activeSeconds,
        tabCount: currentTabCount,
      });
    }, 15000);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const depth = Math.min(100, Math.round((scrollTop / maxScrollable) * 100));
      if (depth < scrollDepthRef.current + 10) return;
      scrollDepthRef.current = depth;
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: "scroll",
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
        metadata: { depthPercent: depth },
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const isVideo = href.startsWith("/videos/");
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: isVideo ? "video_click" : "link_click",
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
        metadata: { href, text: (link.textContent || "").trim().slice(0, 120) },
      });
    };

    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: hidden ? "tab_hidden" : "tab_visible",
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
      });
    };

    const onFocus = () => {
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: "window_focus",
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
      });
    };

    const onBlur = () => {
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType: "window_blur",
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
      });
    };

    const onCustomAnalytics = (event: Event) => {
      const custom = event as CustomEvent<{ eventType?: string; metadata?: Record<string, unknown> }>;
      const eventType = custom.detail?.eventType || "custom";
      const metadata = custom.detail?.metadata || {};
      void postAnalytics("/event", {
        visitorId,
        sessionId,
        eventType,
        path: window.location.pathname,
        url: window.location.href,
        tabCount: getActiveTabCount(),
        metadata,
      });
    };

    const onBeforeUnload = () => {
      const activeSeconds = Math.max(1, Math.round((Date.now() - heartbeatStartedAtRef.current) / 1000));
      void postAnalytics(
        "/session/end",
        {
          visitorId,
          sessionId,
          path: window.location.pathname,
          reason: "before_unload",
          activeSeconds,
          tabCount: getActiveTabCount(),
        },
        true
      );
      removeTabPing(tabId);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("app-analytics-event", onCustomAnalytics as EventListener);

    return () => {
      window.clearInterval(pingInterval);
      window.clearInterval(heartbeatInterval);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("app-analytics-event", onCustomAnalytics as EventListener);
      removeTabPing(tabId);
    };
  }, []);

  useEffect(() => {
    const visitorId = visitorIdRef.current;
    const sessionId = sessionIdRef.current;
    if (!visitorId || !sessionId) return;
    void postAnalytics("/event", {
      visitorId,
      sessionId,
      eventType: "page_view",
      path: pathname || "/",
      url: window.location.href,
      referrer: document.referrer || "",
      tabCount: getActiveTabCount(),
    });
  }, [pathname]);

  useEffect(() => {
    emitAnalyticsEvent("tracker_ready");
  }, []);

  return null;
}

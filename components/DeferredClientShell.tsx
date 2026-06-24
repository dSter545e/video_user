"use client";

import dynamic from "next/dynamic";

const UserAnalyticsTracker = dynamic(() => import("./UserAnalyticsTracker"), { ssr: false });
const AgeGateModal = dynamic(() => import("./AgeGateModal"), { ssr: false });

export default function DeferredClientShell() {
  return (
    <>
      <AgeGateModal />
      <UserAnalyticsTracker />
    </>
  );
}

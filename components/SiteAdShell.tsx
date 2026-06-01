"use client";

import { ReactNode } from "react";
import AdProvider from "./AdProvider";
import AdSlot from "./AdSlot";
import PopupAdModal from "./PopupAdModal";

type SiteAdShellProps = {
  children: ReactNode;
};

export default function SiteAdShell({ children }: SiteAdShellProps) {
  return (
    <AdProvider>
      <PopupAdModal />
      <AdSlot slot="header_leaderboard" className="mx-auto max-w-[1400px] px-3 sm:px-6" />
      {children}
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6">
        <AdSlot slot="footer_above" />
      </div>
    </AdProvider>
  );
}

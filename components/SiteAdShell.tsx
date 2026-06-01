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
      <div className="site-ad-top">
        <AdSlot slot="header_leaderboard" className="mx-auto flex w-full max-w-[1400px] justify-center px-3 sm:px-6" />
      </div>
      <div className="site-main">{children}</div>
      <div className="site-ad-bottom mx-auto flex w-full max-w-[1400px] justify-center px-3 sm:px-6">
        <AdSlot slot="footer_above" className="w-full" />
      </div>
    </AdProvider>
  );
}

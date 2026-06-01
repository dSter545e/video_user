"use client";

import { ReactNode } from "react";

export type SidebarOption<T extends string | number> = {
  value: T;
  label: string;
};

type MobileSidebarOptionRowProps<T extends string | number> = {
  icon: ReactNode;
  label: string;
  value: T;
  options: SidebarOption<T>[];
  onChange: (value: T) => void;
  groupLabel: string;
  wideSegment?: boolean;
};

export default function MobileSidebarOptionRow<T extends string | number>({
  icon,
  label,
  value,
  options,
  onChange,
  groupLabel,
  wideSegment = false,
}: MobileSidebarOptionRowProps<T>) {
  return (
    <div className="mobile-sidebar-nav__row mobile-sidebar-nav__row--options" role="radiogroup" aria-label={groupLabel}>
      <div className="mobile-sidebar-nav__row-main">
        <span className="mobile-sidebar-nav__row-icon" aria-hidden>
          {icon}
        </span>
        <span className="mobile-sidebar-nav__row-label">{label}</span>
      </div>

      <div className={`mobile-sidebar-nav__segment ${wideSegment ? "mobile-sidebar-nav__segment--wide" : ""}`}>
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              onClick={() => onChange(option.value)}
              className={`mobile-sidebar-nav__segment-btn ${isActive ? "mobile-sidebar-nav__segment-btn--active" : ""}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

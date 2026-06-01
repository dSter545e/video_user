"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  getStoredMobileGridColumns,
  getVideoGridClassName,
  MOBILE_GRID_CHANGED_EVENT,
  MobileGridColumns,
  persistMobileGridColumns,
} from "../lib/mobileGrid";

type MobileGridContextValue = {
  columns: MobileGridColumns;
  setColumns: (columns: MobileGridColumns) => void;
  gridClassName: string;
};

const MobileGridContext = createContext<MobileGridContextValue>({
  columns: 1,
  setColumns: () => {},
  gridClassName: getVideoGridClassName(1),
});

export const useMobileGrid = () => useContext(MobileGridContext);

type MobileGridProviderProps = {
  children: ReactNode;
};

export default function MobileGridProvider({ children }: MobileGridProviderProps) {
  const [columns, setColumnsState] = useState<MobileGridColumns>(1);

  useEffect(() => {
    const sync = () => {
      const next = getStoredMobileGridColumns();
      setColumnsState(next);
      document.documentElement.setAttribute("data-mobile-grid", String(next));
    };
    sync();
    window.addEventListener(MOBILE_GRID_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MOBILE_GRID_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setColumns = (next: MobileGridColumns) => {
    persistMobileGridColumns(next);
    setColumnsState(next);
    document.documentElement.setAttribute("data-mobile-grid", String(next));
    window.dispatchEvent(new Event(MOBILE_GRID_CHANGED_EVENT));
  };

  const value = useMemo(
    () => ({
      columns,
      setColumns,
      gridClassName: getVideoGridClassName(columns),
    }),
    [columns]
  );

  return <MobileGridContext.Provider value={value}>{children}</MobileGridContext.Provider>;
}

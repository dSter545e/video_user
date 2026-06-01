"use client";

import { FiVideo } from "react-icons/fi";
import { MobileGridColumns } from "../lib/mobileGrid";
import { useMobileGrid } from "./MobileGridProvider";
import MobileSidebarOptionRow from "./MobileSidebarOptionRow";

const GRID_OPTIONS = [
  { value: 1 as MobileGridColumns, label: "1" },
  { value: 2 as MobileGridColumns, label: "2" },
];

export default function MobileGridSidebarControl() {
  const { columns, setColumns } = useMobileGrid();

  return (
    <MobileSidebarOptionRow
      icon={<FiVideo />}
      label="Videos"
      value={columns}
      options={GRID_OPTIONS}
      onChange={setColumns}
      groupLabel="Videos per row"
    />
  );
}

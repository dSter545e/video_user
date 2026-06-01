"use client";

import { useMobileGrid } from "./MobileGridProvider";

export default function MobileGridSidebarControl() {
  const { columns, setColumns } = useMobileGrid();

  return (
    <div className="mb-5 lg:hidden">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide yt-muted">Video layout (mobile)</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setColumns(1)}
          className={`rounded border px-3 py-2 text-sm font-medium transition ${
            columns === 1
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--border)] bg-[var(--surface-muted)]"
          }`}
        >
          1 per row
        </button>
        <button
          type="button"
          onClick={() => setColumns(2)}
          className={`rounded border px-3 py-2 text-sm font-medium transition ${
            columns === 2
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--border)] bg-[var(--surface-muted)]"
          }`}
        >
          2 per row
        </button>
      </div>
    </div>
  );
}

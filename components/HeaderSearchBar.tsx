"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

type HeaderSearchBarProps = {
  className?: string;
};

export default function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className={`flex w-full max-w-2xl items-center gap-2 ${className}`}>
      <div className="relative min-w-0 flex-1">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 yt-muted" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="yt-input w-full rounded-full py-2 pl-10 pr-4 text-sm outline-none"
          placeholder="Search by video ID, title, or category"
          aria-label="Search videos"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white"
      >
        Search
      </button>
    </form>
  );
}

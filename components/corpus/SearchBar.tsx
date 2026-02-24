"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount?: number;
}

export default function SearchBar({ onSearch, resultCount }: SearchBarProps) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  function handleClear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-fg pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search the knowledge corpus..."
          className="w-full pl-12 pr-12 py-3 rounded-xl bg-surface border border-surface-border
                     text-fg placeholder:text-muted-fg
                     focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal
                     text-base"
          data-no-transition
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 rounded-md
                       text-muted-fg hover:text-fg hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {typeof resultCount === "number" && value.trim() && (
        <p className="mt-2 text-sm text-muted-fg">
          {resultCount} result{resultCount !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
}

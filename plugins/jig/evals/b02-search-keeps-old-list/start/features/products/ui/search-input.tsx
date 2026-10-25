"use client";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

/** The search box: keeps what the user types, and commits it after a 400 ms pause. */
export function SearchInput({ value, onCommit }: { value: string; onCommit: (q: string) => void }) {
  const [draft, setDraft] = useState(value);
  const commit = useDebouncedCallback(onCommit, 400);

  return (
    <Input
      type="search"
      aria-label="Search products by title"
      placeholder="Search products…"
      className="w-full sm:max-w-sm"
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        commit(e.target.value);
      }}
    />
  );
}

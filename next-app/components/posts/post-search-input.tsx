"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PostSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Skip if we're already processing an update to avoid infinite loop
    if (isUpdatingRef.current) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();
      const currentQ = searchParams.get("q") ?? "";

      // Only update if query actually changed
      if (trimmed === currentQ) return;

      isUpdatingRef.current = true;

      if (trimmed.length > 0) {
        params.set("q", trimmed);
        params.set("page", "1");
      } else {
        params.delete("q");
      }

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });

      // Reset flag after navigation completes
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <InputGroup className="h-10 rounded-none border-x-0 border-y-0 bg-transparent shadow-none">
      <InputGroupInput
        placeholder="Search posts..."
        value={query}
        className="font-mono text-sm"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setQuery("");
          }
        }}
      />

      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>

      <InputGroupAddon
        className="pr-2 data-[disabled=true]:hidden"
        align="inline-end"
        data-disabled={!query.length}
      >
        <InputGroupButton
          className="rounded-sm border-none"
          size="icon-xs"
          title="Clear"
          aria-label="Clear"
          onClick={() => setQuery("")}
        >
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

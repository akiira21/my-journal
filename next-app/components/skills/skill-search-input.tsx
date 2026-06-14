"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type SkillSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SkillSearchInput({ value, onChange }: SkillSearchInputProps) {
  const [query, setQuery] = useState(value);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (isUpdatingRef.current) return;

    const timer = setTimeout(() => {
      const trimmed = query.trim();
      const currentQ = value.trim();

      if (trimmed === currentQ) return;

      isUpdatingRef.current = true;
      onChange(trimmed);

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onChange, value]);

  return (
    <InputGroup className="h-10 rounded-none border-x-0 border-y-0 bg-transparent shadow-none">
      <InputGroupInput
        placeholder="Search skills..."
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

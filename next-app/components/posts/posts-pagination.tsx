import Link from "next/link";

import { Button } from "@/components/ui/button";

type PostsPaginationProps = {
  currentPage: number;
  totalPages: number;
  query?: string;
};

function pageHref(page: number, query?: string): string {
  const params = new URLSearchParams({ page: String(page) });
  if (query && query.trim().length > 0) {
    params.set("q", query.trim());
  }
  return `/posts?${params.toString()}`;
}

export function PostsPagination({ currentPage, totalPages, query }: PostsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="screen-line-top mt-4 flex items-center justify-between gap-3 px-4 py-3">
      <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
        <Link
          href={currentPage > 1 ? pageHref(currentPage - 1, query) : pageHref(1, query)}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : 0}
          className={currentPage <= 1 ? "pointer-events-none opacity-45" : ""}
        >
          Previous
        </Link>
      </Button>

      <p className="font-mono text-xs text-muted-foreground">
        Page {currentPage} / {totalPages}
      </p>

      <Button variant="outline" size="sm" asChild disabled={currentPage >= totalPages}>
        <Link
          href={currentPage < totalPages ? pageHref(currentPage + 1, query) : pageHref(totalPages, query)}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : 0}
          className={currentPage >= totalPages ? "pointer-events-none opacity-45" : ""}
        >
          Next
        </Link>
      </Button>
    </div>
  );
}

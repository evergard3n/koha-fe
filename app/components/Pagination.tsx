import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { PaginationMeta } from "~/lib/interfaces/common.interface";

interface PaginationProps {
  meta: PaginationMeta;
}

export function Pagination({ meta }: PaginationProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (meta.totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    navigate(`?${params.toString()}`, { replace: true });
  }

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(meta.page - 1)}
        disabled={meta.page <= 1}
        className="gap-1.5"
      >
        <ChevronLeft className="size-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground tabular-nums">
        Page {meta.page} of {meta.totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
        className="gap-1.5"
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

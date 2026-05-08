import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Keep the input value in sync with the URL when navigating
  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = initialQ;
    }
  }, [initialQ]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }, 300);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate("/", { replace: true });
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="search"
        defaultValue={initialQ}
        onChange={handleChange}
        placeholder="Search novels…"
        className="pl-9 pr-8 bg-secondary border-border focus-visible:ring-primary/50 placeholder:text-muted-foreground/60 w-full"
      />
      {initialQ && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

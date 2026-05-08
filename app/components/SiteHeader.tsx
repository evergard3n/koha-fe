import { Link } from "react-router";
import { BookMarked, Moon, Sun } from "lucide-react";
import { SearchBar } from "~/components/SearchBar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/hooks/useTheme";

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Koha home"
          >
            <BookMarked className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="font-serif text-xl font-semibold tracking-wide text-foreground hidden sm:block">
              Koha
            </span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          <SearchBar className="flex-1 max-w-md" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

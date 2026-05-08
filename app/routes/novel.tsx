import { Link, useParams } from "react-router";
import { ArrowLeft, BookOpen, Hash } from "lucide-react";
import { SiteHeader } from "~/components/SiteHeader";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useNovel } from "~/lib/queries/novels.queries";
import { sanitizeNovelName } from "~/lib/utils/novel";

export function meta({ params }: { params: Record<string, string> }) {
  return [{ title: `${params.id} — Koha` }];
}

function ChapterListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-md" />
      ))}
    </div>
  );
}

export default function Novel() {
  const { id } = useParams<{ id: string }>();
  const { data: novel, isLoading, isError } = useNovel(id ?? "");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          All novels
        </Link>

        {isLoading && (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Separator />
            <ChapterListSkeleton />
          </div>
        )}

        {isError && (
          <p className="text-destructive text-sm">Novel not found.</p>
        )}

        {novel && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
                {sanitizeNovelName(novel.name)}
              </h1>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-sans font-normal text-xs">
                  {novel.chapters.length} {novel.chapters.length === 1 ? "chapter" : "chapters"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-sans font-medium uppercase tracking-widest text-muted-foreground mb-3">
                Chapters
              </h2>

              {novel.chapters.length === 0 && (
                <p className="text-sm text-muted-foreground">No chapters available yet.</p>
              )}

              {novel.chapters.map((chapter) => (
                <Link
                  key={chapter.hash}
                  to={`/${novel.id}/${chapter.hash}`}
                  className="group flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-accent border border-transparent hover:border-border"
                >
                  <Hash className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {chapter.filename.replace(/\.md$/i, "").replace(/[-_]/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {chapter.index}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

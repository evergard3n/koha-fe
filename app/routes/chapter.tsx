import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useChapter, useNovel } from "~/lib/queries/novels.queries";
import { sanitizeNovelName } from "~/lib/utils/novel";
import { cn } from "~/lib/utils";

export function meta({ params }: { params: Record<string, string> }) {
  return [{ title: `Chapter — ${params.id} — Koha` }];
}

export default function Chapter() {
  const { id, hash } = useParams<{ id: string; hash: string }>();
  const { data: novel } = useNovel(id ?? "");
  const { data: chapter, isLoading, isError } = useChapter(id ?? "", hash ?? "");

  const chapters = novel?.chapters ?? [];
  const currentIndex = chapters.findIndex((c) => c.hash === hash);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const chapterLabel = (filename: string) =>
    filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal chapter header — no SiteHeader */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            <Link
              to={`/${id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 group"
            >
              <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <BookOpen className="size-4" />
              <span className="hidden sm:inline truncate max-w-40">
                {novel?.name ? sanitizeNovelName(novel.name) : id}
              </span>
            </Link>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <span className="flex-1 text-sm text-muted-foreground truncate">
              {chapter ? chapterLabel(chapter.filename) : "Loading…"}
            </span>

            {/* Prev / Next icon buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {prevChapter ? (
                <Link
                  to={`/${id}/${prevChapter.hash}`}
                  aria-label="Previous chapter"
                  className={cn(
                    "inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground",
                    "hover:bg-muted hover:text-foreground transition-colors"
                  )}
                >
                  <ArrowLeft className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground/30">
                  <ArrowLeft className="size-4" />
                </span>
              )}

              <span className="text-xs text-muted-foreground tabular-nums px-1">
                {currentIndex >= 0 ? `${currentIndex + 1} / ${chapters.length}` : "—"}
              </span>

              {nextChapter ? (
                <Link
                  to={`/${id}/${nextChapter.hash}`}
                  aria-label="Next chapter"
                  className={cn(
                    "inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground",
                    "hover:bg-muted hover:text-foreground transition-colors"
                  )}
                >
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground/30">
                  <ArrowRight className="size-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Reading area */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-12">
        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-2/3 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        )}

        {isError && (
          <p className="text-destructive text-sm text-center py-20">
            Chapter not found.
          </p>
        )}

        {chapter && (
          <article
            className="
              font-reading text-lg leading-loose text-foreground/90
              [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:leading-tight
              [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8
              [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-3 [&_h3]:mt-6
              [&_p]:mb-5
              [&_strong]:font-semibold [&_strong]:text-foreground
              [&_em]:italic
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-5 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
              [&_hr]:border-none [&_hr]:my-8
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-1
              [&_code]:font-mono [&_code]:text-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
              [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-5 [&_pre]:text-sm
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chapter.content}
            </ReactMarkdown>
          </article>
        )}

        {/* Bottom chapter navigation */}
        {chapter && (
          <div className="flex items-center justify-between gap-4 mt-16 pt-8 border-t border-border">
            {prevChapter ? (
              <Button variant="outline" size="sm" render={<Link to={`/${id}/${prevChapter.hash}`} />} className="gap-2">
                <ArrowLeft className="size-4" />
                <span className="truncate max-w-36">
                  {chapterLabel(prevChapter.filename)}
                </span>
              </Button>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Button variant="outline" size="sm" render={<Link to={`/${id}/${nextChapter.hash}`} />} className="gap-2">
                <span className="truncate max-w-36">
                  {chapterLabel(nextChapter.filename)}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" render={<Link to={`/${id}`} />} className="gap-2">
                <BookOpen className="size-4" />
                Back to novel
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

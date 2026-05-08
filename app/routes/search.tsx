import { useSearchParams } from "react-router";
import { SiteHeader } from "~/components/SiteHeader";
import { NovelCard } from "~/components/NovelCard";
import { Pagination } from "~/components/Pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { useSearchNovels } from "~/lib/queries/novels.queries";

export function meta({ location }: { location: { search: string } }) {
  const q = new URLSearchParams(location.search).get("q") ?? "";
  return [
    { title: q ? `Results for "${q}" — Koha` : "Search — Koha" },
    { name: "description", content: `Search results for ${q}` },
  ];
}

function NovelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading, isError, isFetching } = useSearchNovels({ q, page, pageSize: 18 });

  const showLoading = isLoading || (isFetching && !data);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
            {q ? (
              <>
                Results for{" "}
                <span className="text-primary italic">&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
          {data && (
            <p className="text-muted-foreground text-sm">
              {data.meta.total.toLocaleString()} {data.meta.total === 1 ? "title" : "titles"} found
            </p>
          )}
        </div>

        {!q && (
          <p className="text-muted-foreground">
            Enter a title in the search bar above to get started.
          </p>
        )}

        {showLoading && <NovelGridSkeleton />}

        {isError && (
          <p className="text-destructive text-sm">
            Search failed. Please try again.
          </p>
        )}

        {data && data.novels.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-serif text-2xl text-muted-foreground">No titles found</p>
            <p className="text-sm text-muted-foreground/70">
              Try different keywords or check your spelling.
            </p>
          </div>
        )}

        {data && data.novels.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
            <Pagination meta={data.meta} />
          </>
        )}
      </main>
    </div>
  );
}

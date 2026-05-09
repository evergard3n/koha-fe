import { useSearchParams } from "react-router";
import { SiteHeader } from "~/components/SiteHeader";
import { NovelCard } from "~/components/NovelCard";
import { Pagination } from "~/components/Pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuth } from "~/lib/auth-context";
import { useNovels } from "~/lib/queries/novels.queries";

export function meta() {
  return [
    { title: "Koha — Novel Library" },
    { name: "description", content: "Browse all novels in the Koha library." },
  ];
}

function NovelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  );
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const { status } = useAuth();
  const canQuery = status === "authenticated";

  const { data, isLoading, isError } = useNovels({ page, pageSize: 18 }, canQuery);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {status === "loading" && (
          <p className="text-muted-foreground text-sm">Checking session...</p>
        )}

        {status === "unauthenticated" && (
          <p className="text-muted-foreground text-sm">log in to continue</p>
        )}

        {status === "authenticated" && (
          <>
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground tracking-tight">
            All Novels
          </h1>
          {data && (
            <p className="text-muted-foreground text-sm">
              {data.meta.total.toLocaleString()} titles in the library
            </p>
          )}
        </div>

        {isLoading && <NovelGridSkeleton />}

        {isError && (
          <p className="text-destructive text-sm">
            Failed to load novels. Please try again.
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
            <Pagination meta={data.meta} />
          </>
        )}
          </>
        )}
      </main>
    </div>
  );
}

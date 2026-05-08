import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Novel } from "~/lib/interfaces/novels.interface";
import { sanitizeNovelName } from "~/lib/utils/novel";

interface NovelCardProps {
  novel: Novel;
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link to={`/${novel.id}`} className="group block focus:outline-none">
      <Card className="h-full bg-card border-border transition-all duration-200 group-hover:border-primary/50 group-hover:bg-accent group-focus-visible:ring-2 group-focus-visible:ring-primary/50">
        <CardContent className="flex flex-col gap-3 p-5 h-full">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
              {sanitizeNovelName(novel.name)}
            </h2>
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="size-3.5 shrink-0" />
            <Badge variant="secondary" className="text-xs font-sans font-normal px-1.5 py-0">
              {novel.chapters} {novel.chapters === 1 ? "chapter" : "chapters"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

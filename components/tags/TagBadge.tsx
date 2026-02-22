import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tag, TagCategory } from "@/lib/types";
import { X } from "lucide-react";

const categoryColors: Record<TagCategory, string> = {
  tense: "bg-blue-100 text-blue-800 border-blue-200",
  grammar: "bg-amber-100 text-amber-800 border-amber-200",
  verb: "bg-emerald-100 text-emerald-800 border-emerald-200",
  phrase: "bg-purple-100 text-purple-800 border-purple-200",
};

type TagBadgeProps = {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
};

export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-normal",
        categoryColors[tag.category],
        className
      )}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}

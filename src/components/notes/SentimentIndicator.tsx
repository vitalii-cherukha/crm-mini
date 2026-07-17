import { Frown, Meh, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { SENTIMENT_LABELS, type Sentiment } from "@/lib/types";

const SENTIMENT_CONFIG: Record<Sentiment, { icon: typeof Smile; className: string }> = {
  positive: { icon: Smile, className: "text-success" },
  neutral: { icon: Meh, className: "text-muted-foreground" },
  negative: { icon: Frown, className: "text-destructive" },
};

interface SentimentIndicatorProps {
  sentiment: Sentiment;
}

export function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const { icon: Icon, className } = SENTIMENT_CONFIG[sentiment];

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", className)}>
      <Icon className="h-4 w-4" />
      {SENTIMENT_LABELS[sentiment]}
    </span>
  );
}

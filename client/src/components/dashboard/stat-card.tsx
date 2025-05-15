import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  change?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  change,
  className,
}: StatCardProps) {
  return (
    <div className={cn("grid-card p-4", className)}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full bg-opacity-20", iconColor, `bg-${iconColor.split('-')[1]}`)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className={change.positive ? "text-green-500" : "text-destructive"}>
            {change.positive ? "↑" : "↓"} {change.value}
          </span>{" "}
          from last period
        </div>
      )}
    </div>
  );
}

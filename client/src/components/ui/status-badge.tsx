import { Badge } from "@/components/ui/badge";
import { getStatusColor, getEnforcementColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "enforcement";
}

export default function StatusBadge({ status, type = "status" }: StatusBadgeProps) {
  const colorConfig = type === "status" 
    ? getStatusColor(status)
    : getEnforcementColor(status);
  
  return (
    <Badge 
      variant="outline" 
      className={`${colorConfig.bg} ${colorConfig.text} border-none font-medium`}
    >
      {status}
    </Badge>
  );
}

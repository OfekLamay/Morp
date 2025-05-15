import { getSeverityColor } from "@/lib/utils";

interface SeverityIndicatorProps {
  severity: number;
  showAsNumber?: boolean;
}

export default function SeverityIndicator({ 
  severity, 
  showAsNumber = true 
}: SeverityIndicatorProps) {
  const colorClass = getSeverityColor(severity);
  
  if (showAsNumber) {
    return <span className={`font-medium ${colorClass}`}>{severity}</span>;
  }
  
  // For visualizing as bars or other indicators
  return (
    <div className="flex items-center">
      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass.replace('text-', 'bg-')}`} 
          style={{ width: `${(severity / 10) * 100}%` }}
        />
      </div>
      <span className={`ml-2 text-xs ${colorClass}`}>{severity}</span>
    </div>
  );
}

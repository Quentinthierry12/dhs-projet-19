
interface ProgressBarProps {
  value: number;
  max: number;
  showPercent?: boolean;
  showValues?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max,
  showPercent = true,
  showValues = false,
  className = "",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage >= 80) return "bg-letc-green";
    if (percentage >= 50) return "bg-letc-blue";
    if (percentage >= 30) return "bg-amber-500";
    return "bg-letc-red";
  };
  
  // Determine height based on size
  const getHeightClass = () => {
    switch(size) {
      case "sm": return "h-1.5";
      case "lg": return "h-3";
      default: return "h-2";
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {(showPercent || showValues) && (
        <div className="flex justify-between text-xs font-medium text-gray-500">
          {showValues && <span>{value}/{max}</span>}
          {showPercent && <span>{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${getHeightClass()}`}>
        <div
          className={`${getColorClass()} rounded-full transition-all duration-300 ${getHeightClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

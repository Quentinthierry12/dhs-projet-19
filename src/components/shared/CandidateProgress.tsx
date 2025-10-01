
import React from "react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Candidate } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { calculateCandidateProgress } from "@/lib/data-service";

interface CandidateProgressProps {
  candidate: Candidate;
  showPercent?: boolean;
  showValues?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CandidateProgress: React.FC<CandidateProgressProps> = ({
  candidate,
  showPercent = true,
  showValues = false,
  size = "md",
  className = "",
}) => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['candidate-progress', candidate.id],
    queryFn: () => calculateCandidateProgress(candidate),
    enabled: !!candidate.id,
  });
  
  if (isLoading || !progress) {
    return (
      <div className={`w-full ${className}`}>
        <ProgressBar value={0} max={100} size={size} showPercent={showPercent} showValues={showValues} />
      </div>
    );
  }
  
  // Always use the real maxPossibleScore from the calculation
  return (
    <div className={`w-full ${className}`}>
      <ProgressBar 
        value={progress.totalScore} 
        max={progress.maxPossibleScore}
        size={size}
        showPercent={showPercent}
        showValues={showValues}
      />
    </div>
  );
};

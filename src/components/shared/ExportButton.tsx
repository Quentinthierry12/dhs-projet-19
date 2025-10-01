
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "lg" | "icon";
  children?: React.ReactNode;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  variant = "outline",
  size = "sm",
  children = "Exporter PDF",
  className = ""
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={loading || disabled}
      className={`gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      {loading ? "Export..." : children}
    </Button>
  );
};

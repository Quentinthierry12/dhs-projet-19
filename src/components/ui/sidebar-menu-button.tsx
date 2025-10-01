
import React from "react";
import { cn } from "@/lib/utils";

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({
  children,
  asChild = false,
  className,
}) => {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button className={cn("flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors", className)}>
      {children}
    </button>
  );
};

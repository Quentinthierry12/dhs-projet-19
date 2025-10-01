
import React from "react";

interface SidebarNavProps {
  children: React.ReactNode;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ children }) => {
  return (
    <nav className="flex flex-col space-y-1">
      {children}
    </nav>
  );
};

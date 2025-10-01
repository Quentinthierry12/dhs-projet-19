
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const DirectionRoute = ({ children }: { children: React.ReactNode }) => {
  const { isDirector, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  // If user is not a director, redirect to home
  if (!isDirector) {
    return <Navigate to="/" replace />;
  }

  // Render children if user is Director
  return <>{children || <Outlet />}</>;
};

export default DirectionRoute;

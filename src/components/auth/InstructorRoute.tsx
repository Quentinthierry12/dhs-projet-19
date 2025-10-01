
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface InstructorRouteProps {
  children: React.ReactNode;
}

const InstructorRoute = ({ children }: InstructorRouteProps) => {
  const { isInstructor, isDirector, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Allow both instructors and directors to access instructor routes
  if (!isInstructor && !isDirector) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default InstructorRoute;

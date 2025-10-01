
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, signIn, signOut } from "@/lib/auth-service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDirector: boolean;
  isInstructor: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider render - user:', user, 'isLoading:', isLoading);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthProvider checkAuth starting');
      try {
        setIsLoading(true);
        const user = await getCurrentUser();
        console.log('AuthProvider getCurrentUser result:', user);
        setUser(user);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider checkAuth finished');
      }
    };

    checkAuth();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error: string | null }> => {
    console.log('AuthProvider login called with identifier:', identifier);
    try {
      const { user, error } = await signIn(identifier, password);
      console.log('AuthProvider signIn result:', { user, error });

      if (error || !user) {
        return { success: false, error: error || "Une erreur est survenue" };
      }

      setUser(user);
      return { success: true, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la connexion",
      };
    }
  };

  const logout = async (): Promise<void> => {
    console.log('AuthProvider logout called');
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isDirector = !!user && user.role === "direction";
  const isInstructor = !!user && user.role === "instructeur";
  const isAuthenticated = !!user;
  
  console.log('AuthProvider computed values:', { isAuthenticated, isDirector, isInstructor });
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    isDirector,
    isInstructor,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

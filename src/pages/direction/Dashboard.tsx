
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserIcon, ClockIcon, UserPlusIcon } from "lucide-react";

const Dashboard = () => {
  const { isDirector, isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not a director or not authenticated
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && !isDirector) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard Direction</h1>
      <p className="text-gray-500 mb-8">
        Bienvenue, {user?.prenom} {user?.nom}
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Gestion Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Gérez les comptes instructeurs et direction, créez de nouveaux utilisateurs ou désactivez des comptes existants.
            </p>
            <Link to="/direction/users">
              <Button className="w-full">
                Voir les utilisateurs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5" />
              Nouvel Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Créez un nouveau compte instructeur ou direction avec les permissions appropriées.
            </p>
            <Link to="/direction/users/add">
              <Button className="w-full">
                Créer un utilisateur
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Journaux d'Activité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Consultez les journaux d'activité du système. Filtrez par utilisateur, type d'action ou période.
            </p>
            <Link to="/direction/logs">
              <Button className="w-full">
                Voir les logs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Plus as PlusIcon, Check as CheckIcon, Bone as XIcon, Pencil } from "lucide-react";
import { User, getAllUsers, updateUserActiveStatus } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const UsersList = () => {
  const { isDirector, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs",
          variant: "destructive",
        });
      } finally {
        setFetchingUsers(false);
      }
    };

    if (isDirector) {
      fetchUsers();
    }
  }, [isDirector, toast]);

  // Redirect if not a director or not authenticated
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && !isDirector) {
    return <Navigate to="/" replace />;
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const success = await updateUserActiveStatus(userId, newStatus);
    
    if (success) {
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, active: newStatus } : user
      ));
      
      toast({
        title: "Succès",
        description: `Utilisateur ${newStatus ? "activé" : "désactivé"} avec succès`,
      });
    } else {
      toast({
        title: "Erreur",
        description: `Impossible de ${newStatus ? "activer" : "désactiver"} l'utilisateur`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Link to="/direction/users/add">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Liste des utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez les comptes instructeurs et direction
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingUsers ? (
            <div className="text-center py-8">Chargement des utilisateurs...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Identifiant</TableHead>
                    <TableHead>Speudo Discord</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.prenom} {user.nom}
                        </TableCell>
                        <TableCell>{user.identifiant}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "direction" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role === "direction" ? "Direction" : "Instructeur"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin
                            ? format(new Date(user.lastLogin), "dd/MM/yyyy HH:mm")
                            : "Jamais connecté"}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {user.active ? "Actif" : "Inactif"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant={user.active ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.active)}
                            >
                              {user.active ? (
                                <XIcon className="h-4 w-4" />
                              ) : (
                                <CheckIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/direction/users/${user.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;

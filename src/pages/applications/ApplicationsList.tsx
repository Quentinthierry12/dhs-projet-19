
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllApplications } from "@/lib/application-service";
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, UserPlus, Trophy, AlertCircle } from "lucide-react";
import { ApplicationStatus } from "@/types/police";

// Status badge component helper
const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  switch(status) {
    case "pending":
      return <Badge variant="outline">En attente</Badge>;
    case "reviewing":
      return <Badge className="bg-blue-500">En cours de revue</Badge>;
    case "accepted":
      return <Badge className="bg-emerald-600">Accepté</Badge>;
    case "rejected":
      return <Badge className="bg-red-500">Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ApplicationsList = () => {
  console.log('ApplicationsList component mounted');
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      console.log('Fetching applications...');
      try {
        const result = await getAllApplications();
        console.log('Applications fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error in getAllApplications:', err);
        throw err;
      }
    },
  });

  console.log('ApplicationsList render state:', { applications, isLoading, error });

  if (isLoading) {
    console.log('ApplicationsList: Showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-letc-blue">Candidatures Reçues</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto"></div>
              <p className="mt-2">Chargement des candidatures...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('ApplicationsList: Showing error state:', error);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-letc-blue">Candidatures Reçues</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">Erreur lors du chargement</p>
              <p className="text-sm mt-2">{error?.message || 'Une erreur inconnue est survenue'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('ApplicationsList: Showing main content with', applications?.length, 'applications');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-letc-blue">Candidatures Reçues</h1>
          <p className="text-gray-600 mt-1">
            Transformez les candidatures en inscriptions pour de futurs concours
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/applications/forms">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Gérer les formulaires
            </Button>
          </Link>
          <Button className="bg-letc-blue hover:bg-letc-darkblue">
            <Trophy className="h-4 w-4 mr-2" />
            Créer un concours
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures ({applications?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {applications?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucune candidature soumise</h3>
              <p className="text-sm">
                Les candidatures apparaîtront ici une fois les formulaires remplis par les candidats.
              </p>
              <Link to="/applications/forms">
                <Button variant="outline" className="mt-4">
                  Créer un formulaire de candidature
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du candidat</TableHead>
                  <TableHead>Formulaire</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.applicantName}</TableCell>
                    <TableCell>{application.formName}</TableCell>
                    <TableCell>{format(new Date(application.createdAt), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <StatusBadge status={application.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/applications/${application.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {applications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Créer un concours basé sur les candidatures
              </Button>
              <Button variant="outline" size="sm">
                Exporter les candidatures
              </Button>
              <Button variant="outline" size="sm">
                Notifier les candidats
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationsList;

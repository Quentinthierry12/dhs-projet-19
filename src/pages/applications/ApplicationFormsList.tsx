import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Trash2, Edit, Eye, Users, Trophy, AlertCircle, FileText } from "lucide-react";
import { deleteApplicationForm, getAllApplicationForms } from "@/lib/application-service";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/date-utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const ApplicationFormsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  console.log('ApplicationFormsList component mounted');

  const { data: forms = [], isLoading, error } = useQuery({
    queryKey: ['application-forms'],
    queryFn: async () => {
      console.log('Fetching application forms...');
      try {
        const result = await getAllApplicationForms();
        console.log('Application forms fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('Error in getAllApplicationForms:', err);
        throw err;
      }
    },
  });

  console.log('ApplicationFormsList render state:', { forms, isLoading, error });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplicationForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-forms'] });
      toast({
        title: "Formulaire supprimé",
        description: "Le formulaire a été supprimé avec succès"
      });
      setFormToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le formulaire",
        variant: "destructive"
      });
      console.error("Error deleting form:", error);
    }
  });

  const handleDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete);
    }
  };

  if (isLoading) {
    console.log('ApplicationFormsList: Showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-letc-blue">Types de Formulaires</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto"></div>
              <p className="mt-2">Chargement des formulaires...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('ApplicationFormsList: Showing error state:', error);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-letc-blue">Types de Formulaires</h1>
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

  console.log('ApplicationFormsList: Showing main content with', forms?.length, 'forms');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-letc-blue">Types de Formulaires</h1>
          <p className="text-gray-600 mt-1">
            Créez des formulaires d'inscription pour vos concours et candidatures
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/applications')}>
            <Users className="h-4 w-4 mr-2" />
            Voir les candidatures
          </Button>
          <Link to="/applications/forms/create">
            <Button className="bg-letc-blue hover:bg-letc-darkblue">
              <Plus className="mr-2 h-4 w-4" />
              Créer un formulaire
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulaires de candidature disponibles ({forms?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {forms?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucun formulaire créé</h3>
              <p className="text-sm mb-4">
                Créez un nouveau formulaire de candidature pour commencer.
              </p>
              <Link to="/applications/forms/create">
                <Button className="bg-letc-blue hover:bg-letc-darkblue">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon premier formulaire
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.name}</TableCell>
                    <TableCell>{form.description}</TableCell>
                    <TableCell>{form.fields?.length || 0}</TableCell>
                    <TableCell>{formatDate(form.createdAt)}</TableCell>
                    <TableCell>
                      {form.isActive ? (
                        <Badge className="bg-green-500">Actif</Badge>
                      ) : (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/applications/forms/${form.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/applications/forms/${form.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setFormToDelete(form.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {forms?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Transformer en concours</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Utilisez vos formulaires pour créer des concours automatisés
                </p>
                <Button variant="outline" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  Créer un concours
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Gérer les candidatures</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Consultez et évaluez les candidatures reçues
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/applications')}>
                  <Users className="h-4 w-4 mr-2" />
                  Voir les candidatures
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        title="Supprimer le formulaire"
        description="Êtes-vous sûr de vouloir supprimer ce formulaire ? Cette action ne peut pas être annulée."
        open={!!formToDelete}
        onOpenChange={() => setFormToDelete(null)}
        onConfirm={handleDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};

export default ApplicationFormsList;

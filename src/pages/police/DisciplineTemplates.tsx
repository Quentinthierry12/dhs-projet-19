import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllDisciplinaryTemplates, 
  deleteDisciplinaryTemplate 
} from "@/lib/police-service";
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
import { Plus, Trash2, Edit, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/date-utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const DisciplineTemplates = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['disciplinary-templates'],
    queryFn: () => getAllDisciplinaryTemplates(),
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDisciplinaryTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinary-templates'] });
      toast({
        title: "Modèle supprimé",
        description: "Le modèle a été supprimé avec succès"
      });
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle",
        variant: "destructive"
      });
      console.error("Error deleting template:", error);
    }
  });
  
  const handleDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Modèles Disciplinaires</h1>
        <Link to="/police/discipline-templates/add">
          <Button className="bg-letc-blue hover:bg-letc-darkblue">
            <Plus className="mr-2 h-4 w-4" />
            Créer un modèle
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Modèles disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement des modèles...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Aucun modèle créé</p>
              <p className="text-sm mt-2">
                Créez un nouveau modèle de sanction disciplinaire pour commencer.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          template.type === "warning" ? "bg-yellow-500" : 
                          template.type === "reprimand" ? "bg-orange-500" : 
                          template.type === "suspension" ? "bg-red-500" : 
                          "bg-red-800"
                        }
                      >
                        {template.type === "warning" ? "Avertissement" :
                         template.type === "reprimand" ? "Réprimande" :
                         template.type === "suspension" ? "Suspension" :
                         "Renvoi"}
                      </Badge>
                    </TableCell>
                    <TableCell>{template.agencyId ? "Spécifique" : "Global"}</TableCell>
                    <TableCell>{formatDate(template.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/police/discipline-templates/${template.id}`)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/police/discipline-templates/${template.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setTemplateToDelete(template.id)}
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
      
      <ConfirmDialog
        title="Supprimer le modèle"
        description="Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action ne peut pas être annulée."
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
        onConfirm={handleDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};

export default DisciplineTemplates;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResources, addResource, updateResource, deleteResource, Resource, ResourceInsert, ResourceUpdate } from '@/lib/resource-service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, FileDown } from 'lucide-react';
import { ResourceFormDialog } from '@/components/resources/ResourceFormDialog';
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { UserAccountPDF } from '@/components/pdf/UserAccountPDF';
import { generatePdf } from '@/utils/pdfGenerator';

const ManageResources: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setIsDialogOpen(false);
      setSelectedResource(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  };

  const addMutation = useMutation({
    mutationFn: (newResource: ResourceInsert) => addResource(newResource),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({ title: "Succès", description: "Ressource ajoutée." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, resource }: { id: string; resource: ResourceUpdate }) => updateResource(id, resource),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({ title: "Succès", description: "Ressource mise à jour." });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources']});
      toast({ title: "Succès", description: "Ressource supprimée." });
      setIsConfirmOpen(false);
      setResourceToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (values: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'created_by'>, resourceId?: string) => {
    const resourceData = { ...values, created_by: user?.email || 'Unknown' };
    if (resourceId) {
      updateMutation.mutate({ id: resourceId, resource: resourceData });
    } else {
      addMutation.mutate(resourceData);
    }
  };

  const openDialog = (resource: Resource | null = null) => {
    setSelectedResource(resource);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id);
    setIsConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    if (resourceToDelete) {
      deleteMutation.mutate(resourceToDelete);
    }
  };

  const handleExportSampleUser = async () => {
    const sampleUser = {
      id: 'usr_fictif_001',
      prenom: 'John',
      nom: 'Doe',
      email: 'john.doe@police.com',
      role: 'instructeur',
    };
    await generatePdf(<UserAccountPDF user={sampleUser} />, `fiche_utilisateur_${sampleUser.nom}.pdf`);
    toast({ title: "Succès", description: "Le PDF d'exemple a été généré." });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Ressources</CardTitle>
              <CardDescription>Ajoutez, modifiez ou supprimez des ressources documentaires.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une ressource
              </Button>
              <Button onClick={handleExportSampleUser} variant="secondary">
                <FileDown className="mr-2 h-4 w-4" /> Exporter un exemple PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources?.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                      {resource.name}
                    </a>
                  </TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialog(resource)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(resource.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ResourceFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        resource={selectedResource}
        isSubmitting={addMutation.isPending || updateMutation.isPending}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible."
        variant="destructive"
      />
    </div>
  );
};

export default ManageResources;

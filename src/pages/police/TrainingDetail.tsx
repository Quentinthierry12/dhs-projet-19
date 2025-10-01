
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getTrainingById,
  getTrainingModules,
  createTrainingModule,
  updateTrainingModule,
  deleteTrainingModule
} from "@/lib/police-service";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

const TrainingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    maxScore: ""
  });

  const { data: training, isLoading: isLoadingTraining } = useQuery({
    queryKey: ['police-training', id],
    queryFn: () => getTrainingById(id!),
    enabled: !!id,
  });

  const { data: modules = [], refetch: refetchModules } = useQuery({
    queryKey: ['training-modules', id],
    queryFn: () => getTrainingModules(id!),
    enabled: !!id,
  });

  const createModuleMutation = useMutation({
    mutationFn: createTrainingModule,
    onSuccess: () => {
      toast({
        title: "Module ajouté",
        description: "Le module a été ajouté avec succès.",
      });
      refetchModules();
      setShowAddModule(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le module.",
        variant: "destructive",
      });
      console.error('Error creating module:', error);
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: updateTrainingModule,
    onSuccess: () => {
      toast({
        title: "Module modifié",
        description: "Le module a été modifié avec succès.",
      });
      refetchModules();
      setEditingModule(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le module.",
        variant: "destructive",
      });
      console.error('Error updating module:', error);
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: deleteTrainingModule,
    onSuccess: () => {
      toast({
        title: "Module supprimé",
        description: "Le module a été supprimé avec succès.",
      });
      refetchModules();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le module.",
        variant: "destructive",
      });
      console.error('Error deleting module:', error);
    }
  });

  const resetForm = () => {
    setModuleForm({
      title: "",
      description: "",
      maxScore: ""
    });
  };

  const handleAddModule = () => {
    if (!moduleForm.title || !id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const nextOrderNumber = modules.length + 1;

    createModuleMutation.mutate({
      trainingId: id,
      title: moduleForm.title,
      description: moduleForm.description,
      orderNumber: nextOrderNumber,
      maxScore: moduleForm.maxScore ? parseInt(moduleForm.maxScore) : undefined,
    });
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module.id);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      maxScore: module.maxScore ? module.maxScore.toString() : ""
    });
  };

  const handleUpdateModule = () => {
    if (!moduleForm.title || !editingModule) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const moduleToUpdate = modules.find(m => m.id === editingModule);
    if (!moduleToUpdate) return;

    updateModuleMutation.mutate({
      id: editingModule,
      trainingId: moduleToUpdate.trainingId,
      title: moduleForm.title,
      description: moduleForm.description,
      orderNumber: moduleToUpdate.orderNumber,
      maxScore: moduleForm.maxScore ? parseInt(moduleForm.maxScore) : undefined,
      createdAt: moduleToUpdate.createdAt,
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      deleteModuleMutation.mutate(moduleId);
    }
  };

  if (isLoadingTraining) {
    return <div>Chargement...</div>;
  }

  if (!training) {
    return <div>Formation non trouvée</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Détails de la Formation</h1>
        <Button variant="outline" onClick={() => navigate('/police/trainings')}>
          Retour à la liste
        </Button>
      </div>

      {/* Training Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Informations de la formation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Titre</Label>
              <p className="text-lg font-semibold">{training.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Agence</Label>
              <p className="text-lg">{training.agencyName}</p>
            </div>
            {training.description && (
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-lg">{training.description}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-500">Date de création</Label>
              <p className="text-lg">{new Date(training.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Modules de formation</CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowAddModule(!showAddModule)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un module
          </Button>
        </CardHeader>
        <CardContent>
          {(showAddModule || editingModule) && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">
                {editingModule ? "Modifier le module" : "Ajouter un module"}
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="Titre du module"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Description du module"
                  />
                </div>
                <div>
                  <Label htmlFor="maxScore">Score maximum</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    value={moduleForm.maxScore}
                    onChange={(e) => setModuleForm({ ...moduleForm, maxScore: e.target.value })}
                    placeholder="Score maximum"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingModule ? handleUpdateModule : handleAddModule}
                    disabled={createModuleMutation.isPending || updateModuleMutation.isPending}
                  >
                    {editingModule ? "Modifier" : "Ajouter"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddModule(false);
                      setEditingModule(null);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {modules.length === 0 ? (
              <p className="text-gray-500">Aucun module configuré</p>
            ) : (
              modules.map((module) => (
                <div key={module.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Module {module.orderNumber}</Badge>
                      <p className="font-medium">{module.title}</p>
                    </div>
                    {module.description && (
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                    )}
                    {module.maxScore && (
                      <p className="text-sm text-gray-500">Score max: {module.maxScore}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteModule(module.id)}
                      disabled={deleteModuleMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingDetail;

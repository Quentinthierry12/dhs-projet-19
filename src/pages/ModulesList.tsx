import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getModules, 
  addModule, 
  updateModule, 
  removeModule,
  addSubModule,
  updateSubModule,
  removeSubModule
} from "@/lib/data-service";
import { Module, SubModule } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Home,
  User,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { logModuleActivity, logSubModuleActivity } from "@/lib/module-activity-logger";

const ModulesList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleOrder, setModuleOrder] = useState(1);
  const [moduleInstructor, setModuleInstructor] = useState("");
  
  // State for submodule dialog
  const [subModuleDialogOpen, setSubModuleDialogOpen] = useState(false);
  const [editingSubModule, setEditingSubModule] = useState<SubModule | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [subModuleName, setSubModuleName] = useState("");
  const [subModuleOrder, setSubModuleOrder] = useState(1);
  const [subModuleMaxScore, setSubModuleMaxScore] = useState(10);
  const [subModuleIsOptional, setSubModuleIsOptional] = useState(false);
  const [subModuleAppreciation, setSubModuleAppreciation] = useState("");
  
  // State for delete confirmations
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
  const [deleteSubModuleDialogOpen, setDeleteSubModuleDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string>("");

  // Fetch modules
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  // Module mutations avec logs
  const addModuleMutation = useMutation({
    mutationFn: addModule,
    onSuccess: async (data) => {
      await logModuleActivity('create', data.id, moduleName, {
        newValues: {
          name: moduleName,
          description: moduleDescription,
          orderNumber: moduleOrder,
          instructorInCharge: moduleInstructor
        }
      });

      toast({
        title: "Module ajouté",
        description: "Le module a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setModuleDialogOpen(false);
      resetModuleForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du module",
        variant: "destructive",
      });
      console.error("Error adding module:", error);
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateModule(id, data),
    onSuccess: async (data, variables) => {
      const oldModule = modules.find(m => m.id === variables.id);
      
      await logModuleActivity('update', variables.id, moduleName, {
        oldValues: oldModule ? {
          name: oldModule.name,
          description: oldModule.description,
          orderNumber: oldModule.orderNumber,
          instructorInCharge: oldModule.instructorInCharge
        } : undefined,
        newValues: {
          name: moduleName,
          description: moduleDescription,
          orderNumber: moduleOrder,
          instructorInCharge: moduleInstructor
        }
      });

      toast({
        title: "Module modifié",
        description: "Le module a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setModuleDialogOpen(false);
      resetModuleForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du module",
        variant: "destructive",
      });
      console.error("Error updating module:", error);
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: removeModule,
    onSuccess: async (data, moduleId) => {
      const deletedModule = modules.find(m => m.id === moduleId);
      
      await logModuleActivity('delete', moduleId, deletedModule?.name || 'Module supprimé', {
        oldValues: deletedModule ? {
          name: deletedModule.name,
          description: deletedModule.description,
          orderNumber: deletedModule.orderNumber,
          instructorInCharge: deletedModule.instructorInCharge
        } : undefined
      });

      toast({
        title: "Module supprimé",
        description: "Le module a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setDeleteModuleDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du module",
        variant: "destructive",
      });
      console.error("Error deleting module:", error);
    }
  });

  // SubModule mutations avec logs
  const addSubModuleMutation = useMutation({
    mutationFn: addSubModule,
    onSuccess: async (data) => {
      const parentModule = modules.find(m => m.id === selectedModuleId);
      
      await logSubModuleActivity(
        'create', 
        data.id, 
        subModuleName,
        selectedModuleId,
        parentModule?.name,
        {
          newValues: {
            name: subModuleName,
            orderNumber: subModuleOrder,
            maxScore: subModuleMaxScore,
            isOptional: subModuleIsOptional,
            appreciation: subModuleAppreciation
          }
        }
      );

      toast({
        title: "Sous-module ajouté",
        description: "Le sous-module a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setSubModuleDialogOpen(false);
      resetSubModuleForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du sous-module",
        variant: "destructive",
      });
      console.error("Error adding submodule:", error);
    }
  });

  const updateSubModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSubModule(id, data),
    onSuccess: async (data, variables) => {
      const parentModule = modules.find(m => m.id === selectedModuleId);
      const oldSubModule = parentModule?.subModules?.find(sm => sm.id === variables.id);
      
      await logSubModuleActivity(
        'update', 
        variables.id, 
        subModuleName,
        selectedModuleId,
        parentModule?.name,
        {
          oldValues: oldSubModule ? {
            name: oldSubModule.name,
            orderNumber: oldSubModule.orderNumber,
            maxScore: oldSubModule.maxScore,
            isOptional: oldSubModule.isOptional,
            appreciation: oldSubModule.appreciation
          } : undefined,
          newValues: {
            name: subModuleName,
            orderNumber: subModuleOrder,
            maxScore: subModuleMaxScore,
            isOptional: subModuleIsOptional,
            appreciation: subModuleAppreciation
          }
        }
      );

      toast({
        title: "Sous-module modifié",
        description: "Le sous-module a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setSubModuleDialogOpen(false);
      resetSubModuleForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du sous-module",
        variant: "destructive",
      });
      console.error("Error updating submodule:", error);
    }
  });

  const deleteSubModuleMutation = useMutation({
    mutationFn: removeSubModule,
    onSuccess: async (data, subModuleId) => {
      // Trouver le sous-module supprimé
      let deletedSubModule: SubModule | undefined;
      let parentModule: Module | undefined;
      
      for (const module of modules) {
        const subModule = module.subModules?.find(sm => sm.id === subModuleId);
        if (subModule) {
          deletedSubModule = subModule;
          parentModule = module;
          break;
        }
      }
      
      await logSubModuleActivity(
        'delete', 
        subModuleId, 
        deletedSubModule?.name || 'Sous-module supprimé',
        parentModule?.id,
        parentModule?.name,
        {
          oldValues: deletedSubModule ? {
            name: deletedSubModule.name,
            orderNumber: deletedSubModule.orderNumber,
            maxScore: deletedSubModule.maxScore,
            isOptional: deletedSubModule.isOptional,
            appreciation: deletedSubModule.appreciation
          } : undefined
        }
      );

      toast({
        title: "Sous-module supprimé",
        description: "Le sous-module a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setDeleteSubModuleDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du sous-module",
        variant: "destructive",
      });
      console.error("Error deleting submodule:", error);
    }
  });

  const resetModuleForm = () => {
    setModuleName("");
    setModuleDescription("");
    setModuleOrder(1);
    setModuleInstructor("");
    setEditingModule(null);
  };

  const resetSubModuleForm = () => {
    setSubModuleName("");
    setSubModuleOrder(1);
    setSubModuleMaxScore(10);
    setSubModuleIsOptional(false);
    setSubModuleAppreciation("");
    setSelectedModuleId("");
    setEditingSubModule(null);
  };

  const handleAddModule = () => {
    resetModuleForm();
    setModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleName(module.name);
    setModuleDescription(module.description || "");
    setModuleOrder(module.orderNumber);
    setModuleInstructor(module.instructorInCharge || "");
    setModuleDialogOpen(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    setItemToDelete(moduleId);
    setDeleteModuleDialogOpen(true);
  };

  const handleAddSubModule = (moduleId: string) => {
    resetSubModuleForm();
    setSelectedModuleId(moduleId);
    setSubModuleDialogOpen(true);
  };

  const handleEditSubModule = (subModule: SubModule) => {
    setEditingSubModule(subModule);
    setSelectedModuleId(subModule.moduleId);
    setSubModuleName(subModule.name);
    setSubModuleOrder(subModule.orderNumber);
    setSubModuleMaxScore(subModule.maxScore);
    setSubModuleIsOptional(subModule.isOptional || false);
    setSubModuleAppreciation(subModule.appreciation || "");
    setSubModuleDialogOpen(true);
  };

  const handleDeleteSubModule = (subModuleId: string) => {
    setItemToDelete(subModuleId);
    setDeleteSubModuleDialogOpen(true);
  };

  const handleSaveModule = () => {
    const moduleData = {
      name: moduleName,
      description: moduleDescription,
      orderNumber: moduleOrder,
      instructorInCharge: moduleInstructor,
    };

    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: moduleData });
    } else {
      addModuleMutation.mutate(moduleData);
    }
  };

  const handleSaveSubModule = () => {
    const subModuleData = {
      moduleId: selectedModuleId,
      name: subModuleName,
      orderNumber: subModuleOrder,
      maxScore: subModuleMaxScore,
      isOptional: subModuleIsOptional,
      appreciation: subModuleAppreciation,
    };

    if (editingSubModule) {
      updateSubModuleMutation.mutate({ 
        id: editingSubModule.id, 
        data: {
          name: subModuleName,
          orderNumber: subModuleOrder,
          maxScore: subModuleMaxScore,
          isOptional: subModuleIsOptional,
          appreciation: subModuleAppreciation,
        }
      });
    } else {
      addSubModuleMutation.mutate(subModuleData);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-letc-blue">Modules de Formation</h1>
            <p className="text-gray-600">Gérez les modules et sous-modules de formation FLETC</p>
          </div>
        </div>
        <Button 
          onClick={handleAddModule}
          className="bg-letc-blue hover:bg-letc-darkblue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Module
        </Button>
      </div>

      {/* Modules Grid */}
      <div className="space-y-6">
        {modules.length > 0 ? (
          modules.map(module => (
            <Card key={module.id} className="shadow-md">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-letc-blue" />
                        {module.name}
                      </CardTitle>
                      <Badge variant="outline">
                        Ordre: {module.orderNumber}
                      </Badge>
                    </div>
                    {module.description && (
                      <p className="text-gray-600 mt-2">{module.description}</p>
                    )}
                    {module.instructorInCharge && (
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-letc-blue" />
                        <span className="text-sm text-gray-700">
                          Instructeur: <span className="font-medium">{module.instructorInCharge}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditModule(module)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSubModule(module.id)}
                      className="text-letc-blue border-letc-blue hover:bg-letc-blue hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Sous-module
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {module.subModules && module.subModules.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 mb-3">Sous-modules :</h4>
                    <div className="divide-y">
                      {module.subModules.map(subModule => (
                        <div key={subModule.id} className="py-3 flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium">{subModule.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                Ordre: {subModule.orderNumber}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Max: {subModule.maxScore} pts
                              </Badge>
                              {subModule.isOptional && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Optionnel
                                </Badge>
                              )}
                            </div>
                            {subModule.appreciation && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Appréciation:</strong> {subModule.appreciation}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSubModule(subModule)}
                              className="text-gray-600 hover:text-letc-blue"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubModule(subModule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">Aucun sous-module</p>
                    <p className="text-sm">Commencez par ajouter des sous-modules à ce module</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-md">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun module disponible</h3>
              <p className="text-gray-500 mb-4">
                Commencez par créer votre premier module de formation
              </p>
              <Button 
                onClick={handleAddModule}
                className="bg-letc-blue hover:bg-letc-darkblue"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un module
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Modifier le module" : "Nouveau module"}
            </DialogTitle>
            <DialogDescription>
              {editingModule 
                ? "Modifiez les informations du module" 
                : "Créez un nouveau module de formation"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-name">Nom du module</Label>
              <Input
                id="module-name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Ex: Techniques d'intervention"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module-description">Description (optionnel)</Label>
              <Textarea
                id="module-description"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Description du module..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-instructor">Instructeur en charge</Label>
              <Input
                id="module-instructor"
                value={moduleInstructor}
                onChange={(e) => setModuleInstructor(e.target.value)}
                placeholder="Nom de l'instructeur responsable"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="module-order">Ordre d'affichage</Label>
              <Input
                id="module-order"
                type="number"
                min="1"
                value={moduleOrder}
                onChange={(e) => setModuleOrder(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setModuleDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveModule}
              disabled={!moduleName.trim() || addModuleMutation.isPending || updateModuleMutation.isPending}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              {(addModuleMutation.isPending || updateModuleMutation.isPending) 
                ? "Enregistrement..." 
                : editingModule ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubModule Dialog */}
      <Dialog open={subModuleDialogOpen} onOpenChange={setSubModuleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubModule ? "Modifier le sous-module" : "Nouveau sous-module"}
            </DialogTitle>
            <DialogDescription>
              {editingSubModule 
                ? "Modifiez les informations du sous-module" 
                : "Créez un nouveau sous-module"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submodule-name">Nom du sous-module</Label>
              <Input
                id="submodule-name"
                value={subModuleName}
                onChange={(e) => setSubModuleName(e.target.value)}
                placeholder="Ex: Techniques de base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="submodule-order">Ordre d'affichage</Label>
              <Input
                id="submodule-order"
                type="number"
                min="1"
                value={subModuleOrder}
                onChange={(e) => setSubModuleOrder(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="submodule-maxscore">Score maximum</Label>
              <Input
                id="submodule-maxscore"
                type="number"
                min="1"
                value={subModuleMaxScore}
                onChange={(e) => setSubModuleMaxScore(parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="submodule-optional"
                checked={subModuleIsOptional}
                onCheckedChange={(checked) => setSubModuleIsOptional(checked as boolean)}
              />
              <Label htmlFor="submodule-optional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Module optionnel
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submodule-appreciation">Appréciation (optionnel)</Label>
              <Textarea
                id="submodule-appreciation"
                value={subModuleAppreciation}
                onChange={(e) => setSubModuleAppreciation(e.target.value)}
                placeholder="Appréciation générale du sous-module..."
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSubModuleDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveSubModule}
              disabled={!subModuleName.trim() || addSubModuleMutation.isPending || updateSubModuleMutation.isPending}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              {(addSubModuleMutation.isPending || updateSubModuleMutation.isPending) 
                ? "Enregistrement..." 
                : editingSubModule ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Confirmation */}
      <ConfirmDialog
        title="Supprimer le module"
        description="Êtes-vous sûr de vouloir supprimer ce module ? Cette action supprimera aussi tous les sous-modules associés et ne peut pas être annulée."
        open={deleteModuleDialogOpen}
        onOpenChange={setDeleteModuleDialogOpen}
        onConfirm={() => deleteModuleMutation.mutate(itemToDelete)}
        confirmText="Supprimer"
        variant="destructive"
      />

      {/* Delete SubModule Confirmation */}
      <ConfirmDialog
        title="Supprimer le sous-module"
        description="Êtes-vous sûr de vouloir supprimer ce sous-module ? Cette action ne peut pas être annulée."
        open={deleteSubModuleDialogOpen}
        onOpenChange={setDeleteSubModuleDialogOpen}
        onConfirm={() => deleteSubModuleMutation.mutate(itemToDelete)}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};

export default ModulesList;

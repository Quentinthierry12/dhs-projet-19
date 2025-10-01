
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  getAgencyById, 
  getGradesByAgency, 
  addGrade,
  getAgentsByAgency 
} from "@/lib/police-service";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Users, Award } from "lucide-react";

const AgencyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    name: "",
    order: 1,
    authorityLevel: 1
  });

  const { data: agency, isLoading: isLoadingAgency } = useQuery({
    queryKey: ['agency', id],
    queryFn: () => id ? getAgencyById(id) : Promise.resolve(undefined),
    enabled: !!id,
  });

  const { data: grades = [], isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades', id],
    queryFn: () => id ? getGradesByAgency(id) : Promise.resolve([]),
    enabled: !!id,
  });

  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents', id],
    queryFn: () => id ? getAgentsByAgency(id) : Promise.resolve([]),
    enabled: !!id,
  });

  const addGradeMutation = useMutation({
    mutationFn: (data: { name: string; agencyId: string; orderNumber: number; authorityLevel?: number }) => 
      addGrade(data),
    onSuccess: () => {
      toast({
        title: "Grade ajouté",
        description: "Le grade a été ajouté avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['grades', id] });
      setGradeDialogOpen(false);
      setGradeForm({ name: "", order: 1, authorityLevel: 1 });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du grade",
        variant: "destructive",
      });
    }
  });

  const handleAddGrade = () => {
    if (!gradeForm.name.trim() || !id) return;

    addGradeMutation.mutate({
      name: gradeForm.name,
      agencyId: id,
      orderNumber: gradeForm.order,
      authorityLevel: gradeForm.authorityLevel
    });
  };

  if (isLoadingAgency) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Agence introuvable</h2>
        <p className="mt-2 text-gray-500">L'agence demandée n'existe pas</p>
        <Button onClick={() => navigate("/police/agencies")} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/police/agencies")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">{agency.name}</h1>
        <Badge>{agency.acronym}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nom complet</p>
              <p>{agency.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Acronyme</p>
              <p>{agency.acronym}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date de création</p>
              <p>{new Date(agency.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Grades</CardTitle>
              <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un grade</DialogTitle>
                    <DialogDescription>
                      Créer un nouveau grade pour cette agence
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gradeName">Nom du grade</Label>
                      <Input
                        id="gradeName"
                        value={gradeForm.name}
                        onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
                        placeholder="Ex: Lieutenant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gradeOrder">Ordre hiérarchique</Label>
                      <Input
                        id="gradeOrder"
                        type="number"
                        min="1"
                        value={gradeForm.order}
                        onChange={(e) => setGradeForm({ ...gradeForm, order: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="authorityLevel">Niveau d'autorité</Label>
                      <Input
                        id="authorityLevel"
                        type="number"
                        min="1"
                        max="10"
                        value={gradeForm.authorityLevel}
                        onChange={(e) => setGradeForm({ ...gradeForm, authorityLevel: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <Button 
                      onClick={handleAddGrade} 
                      disabled={!gradeForm.name.trim() || addGradeMutation.isPending}
                      className="w-full"
                    >
                      {addGradeMutation.isPending ? "Ajout..." : "Ajouter le grade"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingGrades ? (
              <p className="text-center py-4">Chargement...</p>
            ) : grades.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Aucun grade</p>
            ) : (
              <div className="space-y-2">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{grade.name}</span>
                    <Badge variant="outline">#{grade.order}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <p className="text-center py-4">Chargement...</p>
            ) : agents.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Aucun agent</p>
            ) : (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-sm text-gray-500">agent{agents.length !== 1 && 's'} enregistré{agents.length !== 1 && 's'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDetail;

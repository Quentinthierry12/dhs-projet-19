
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { addClass, getCandidates, sendClassCreationWebhook } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

const AddClass = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    instructorName: "",
    candidateIds: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates,
  });

  const handleCandidateToggle = (candidateId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        candidateIds: [...formData.candidateIds, candidateId]
      });
    } else {
      setFormData({
        ...formData,
        candidateIds: formData.candidateIds.filter(id => id !== candidateId)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.instructorName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newClass = await addClass({
        name: formData.name,
        instructorName: formData.instructorName,
        candidateIds: formData.candidateIds,
      });

      // Send webhook notification
      await sendClassCreationWebhook(newClass);

      toast({
        title: "Classe créée",
        description: `La classe "${newClass.name}" a été créée avec succès`,
      });

      navigate("/classes");
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la classe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/classes")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">Créer une classe</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nouvelle classe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de la classe *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Formation de base #1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructorName">Nom de l'instructeur *</Label>
                <Input
                  id="instructorName"
                  type="text"
                  value={formData.instructorName}
                  onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                  placeholder="Ex: John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Candidats</Label>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {isLoadingCandidates ? (
                  <p className="text-gray-500">Chargement des candidats...</p>
                ) : candidates.length === 0 ? (
                  <p className="text-gray-500">Aucun candidat disponible</p>
                ) : (
                  <div className="space-y-2">
                    {candidates.map((candidate) => (
                      <div key={candidate.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={candidate.id}
                          checked={formData.candidateIds.includes(candidate.id)}
                          onCheckedChange={(checked) => 
                            handleCandidateToggle(candidate.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={candidate.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {candidate.name} (#{candidate.serverId})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.candidateIds.length} candidat(s) sélectionné(s)
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-letc-blue hover:bg-letc-darkblue"
            >
              {isLoading ? "Création en cours..." : "Créer la classe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddClass;

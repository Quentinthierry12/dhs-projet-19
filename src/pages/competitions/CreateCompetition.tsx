import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompetition } from "@/lib/competition-service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateCompetition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "externe" as "externe" | "interne" | "privé",
    specialty: "",
    maxScore: 20,
    isEntryTest: false,
    startDate: "",
    endDate: "",
  });

  const createMutation = useMutation({
    mutationFn: createCompetition,
    onSuccess: (data) => {
      toast({
        title: "Concours créé",
        description: "Le concours a été créé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      
      // Rediriger vers la gestion des invitations si c'est un concours privé
      if (formData.type === 'privé') {
        navigate(`/direction/competitions/${data.id}/invitations`);
      } else {
        navigate('/direction/competitions');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du concours.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un concours.",
        variant: "destructive"
      });
      return;
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        toast({
          title: "Erreur",
          description: "La date de fin doit être postérieure à la date de début.",
          variant: "destructive"
        });
        return;
      }
    }

    createMutation.mutate({
      ...formData,
      createdBy: user.email
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">Créer un Concours</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du concours</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (HTML supporté)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Utilisez du HTML pour la mise en forme : <h3>Titre</h3>, <p>Paragraphe</p>, <ul><li>Liste</li></ul>, <strong>Gras</strong>, <em>Italique</em>"
                rows={8}
                className="font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                Vous pouvez utiliser les balises HTML de base pour la mise en forme
              </p>
            </div>

            <div>
              <Label htmlFor="type">Type de concours</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: "externe" | "interne" | "privé") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="externe">Externe (Public)</SelectItem>
                  <SelectItem value="interne">Interne (Agents)</SelectItem>
                  <SelectItem value="privé">Privé (Sur invitation)</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.type === 'privé' && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Les concours privés nécessitent des invitations. Après création, vous pourrez gérer les invitations et générer les identifiants de connexion.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="specialty">Spécialité (optionnel)</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="ex: Brigade Anti-Criminalité"
              />
            </div>

            <div>
              <Label htmlFor="maxScore">Note maximale</Label>
              <Input
                id="maxScore"
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début (optionnel)</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Date de fin (optionnel)</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEntryTest"
                checked={formData.isEntryTest}
                onCheckedChange={(checked) => setFormData({ ...formData, isEntryTest: checked as boolean })}
              />
              <Label htmlFor="isEntryTest">Test d'entrée LETC (crée automatiquement un candidat lors de l'acceptation)</Label>
            </div>

            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? 'Création...' : 
                formData.type === 'privé' ? 'Créer et gérer les invitations' : 'Créer le concours'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCompetition;

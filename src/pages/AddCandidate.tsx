
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addCandidate } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

const AddCandidate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    serverId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.serverId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newCandidate = await addCandidate({
        name: formData.name,
        serverId: formData.serverId,
      });

      toast({
        title: "Candidat ajouté",
        description: `${newCandidate.name} a été ajouté avec succès`,
      });

      navigate("/candidates");
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du candidat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate("/candidates")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">Ajouter un candidat</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Nouveau candidat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom RP *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: John Smith"
                required
              />
            </div>

            <div>
              <Label htmlFor="serverId">ID Serveur *</Label>
              <Input
                id="serverId"
                type="text"
                value={formData.serverId}
                onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                placeholder="Ex: 123456789"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-letc-blue hover:bg-letc-darkblue"
            >
              {isLoading ? "Ajout en cours..." : "Ajouter le candidat"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCandidate;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createDisciplinaryTemplate } from "@/lib/police-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DisciplinaryType } from "@/types/police";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddDisciplineTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<DisciplinaryType>("warning");
  
  const createMutation = useMutation({
    mutationFn: (templateData: {
      title: string;
      type: DisciplinaryType;
      content: string;
      createdBy: string;
    }) => createDisciplinaryTemplate(templateData),
    onSuccess: () => {
      toast({
        title: "Modèle créé",
        description: "Le modèle disciplinaire a été créé avec succès"
      });
      navigate("/police/discipline-templates");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le modèle disciplinaire",
        variant: "destructive"
      });
      console.error("Error creating template:", error);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (!content) {
      toast({
        title: "Erreur",
        description: "Le contenu est requis",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate({
      title,
      type,
      content,
      createdBy: user?.email || "unknown"
    });
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Créer un modèle disciplinaire</CardTitle>
          <CardDescription>
            Créez un nouveau modèle pour les sanctions disciplinaires.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du modèle"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as DisciplinaryType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="reprimand">Réprimande</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="dismissal">Renvoi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu du modèle"
                rows={5}
              />
            </div>
            <Button disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDisciplineTemplate;

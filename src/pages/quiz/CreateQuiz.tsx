
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuiz, getModulesForQuiz, getSubModulesForQuiz } from "@/lib/quiz-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    moduleId: "",
    subModuleId: "",
    maxScore: 100,
    timeLimit: "",
    isActive: true,
    allowRetakes: false,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['modules-for-quiz'],
    queryFn: getModulesForQuiz,
  });

  const { data: subModules = [] } = useQuery({
    queryKey: ['sub-modules-for-quiz', formData.moduleId],
    queryFn: () => getSubModulesForQuiz(formData.moduleId || undefined),
    enabled: !!formData.moduleId,
  });

  const createMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success("Quiz créé avec succès");
      navigate(`/quiz/${data.id}/edit`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du quiz");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      moduleId: formData.moduleId || undefined,
      subModuleId: formData.subModuleId || undefined,
      maxScore: formData.maxScore,
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
      isActive: formData.isActive,
      allowRetakes: formData.allowRetakes,
      createdBy: "current-user", // À remplacer par l'utilisateur connecté
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Reset sub-module when module changes
    if (field === 'moduleId') {
      setFormData(prev => ({
        ...prev,
        subModuleId: "",
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/quiz')}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux quiz
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">Créer un Quiz</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du Quiz *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Entrez le titre du quiz"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description optionnelle du quiz"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="module">Module (optionnel)</Label>
                  <Select 
                    value={formData.moduleId} 
                    onValueChange={(value) => handleInputChange('moduleId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun module</SelectItem>
                      {modules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.moduleId && (
                  <div>
                    <Label htmlFor="subModule">Sous-module (optionnel)</Label>
                    <Select 
                      value={formData.subModuleId} 
                      onValueChange={(value) => handleInputChange('subModuleId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un sous-module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun sous-module</SelectItem>
                        {subModules.map((subModule) => (
                          <SelectItem key={subModule.id} value={subModule.id}>
                            {subModule.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxScore">Score Maximum</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    value={formData.maxScore}
                    onChange={(e) => handleInputChange('maxScore', parseInt(e.target.value) || 100)}
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Limite de temps (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                    placeholder="Laisser vide pour illimité"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Quiz actif</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowRetakes">Autoriser les reprises</Label>
                    <Switch
                      id="allowRetakes"
                      checked={formData.allowRetakes}
                      onCheckedChange={(checked) => handleInputChange('allowRetakes', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/quiz')}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-letc-blue hover:bg-letc-darkblue"
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Création..." : "Créer le Quiz"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;


import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSystemTemplates, updateSystemTemplates } from "@/lib/police-service";
import { Settings, FileText, Save } from "lucide-react";
import { SystemTemplateConfig } from "@/types/police";

const SystemTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['system-templates'],
    queryFn: getSystemTemplates,
  });

  const [config, setConfig] = useState<SystemTemplateConfig>({
    modules: false,
    disciplines: false,
    agencies: false,
    grades: false,
    trainings: false,
  });

  React.useEffect(() => {
    if (templates) {
      setConfig({
        modules: templates.modules || false,
        disciplines: templates.disciplines || false,
        agencies: templates.agencies || false,
        grades: templates.grades || false,
        trainings: templates.trainings || false,
      });
    }
  }, [templates]);

  const updateMutation = useMutation({
    mutationFn: updateSystemTemplates,
    onSuccess: () => {
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration des modèles a été mise à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ['system-templates'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive",
      });
      console.error('Error updating templates:', error);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  const handleToggle = (key: keyof SystemTemplateConfig, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Configuration des Modèles</h1>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Modèles de Documents</CardTitle>
          </div>
          <CardDescription>
            Configurez quels modèles de documents sont activés dans le système.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="modules">Modèles de Modules</Label>
              <p className="text-sm text-muted-foreground">
                Certificats de validation de modules de formation
              </p>
            </div>
            <Switch
              id="modules"
              checked={config.modules}
              onCheckedChange={(checked) => handleToggle('modules', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disciplines">Modèles Disciplinaires</Label>
              <p className="text-sm text-muted-foreground">
                Avis et rapports disciplinaires
              </p>
            </div>
            <Switch
              id="disciplines"
              checked={config.disciplines}
              onCheckedChange={(checked) => handleToggle('disciplines', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="agencies">Modèles d'Agences</Label>
              <p className="text-sm text-muted-foreground">
                Documents spécifiques aux agences
              </p>
            </div>
            <Switch
              id="agencies"
              checked={config.agencies}
              onCheckedChange={(checked) => handleToggle('agencies', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="grades">Modèles de Grades</Label>
              <p className="text-sm text-muted-foreground">
                Certificats de promotion et de grade
              </p>
            </div>
            <Switch
              id="grades"
              checked={config.grades}
              onCheckedChange={(checked) => handleToggle('grades', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trainings">Modèles de Formations</Label>
              <p className="text-sm text-muted-foreground">
                Certificats de completion de formations
              </p>
            </div>
            <Switch
              id="trainings"
              checked={config.trainings}
              onCheckedChange={(checked) => handleToggle('trainings', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>État Actuel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <span>Modules</span>
              <span className={config.modules ? "text-green-600" : "text-gray-500"}>
                {config.modules ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span>Disciplines</span>
              <span className={config.disciplines ? "text-green-600" : "text-gray-500"}>
                {config.disciplines ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span>Agences</span>
              <span className={config.agencies ? "text-green-600" : "text-gray-500"}>
                {config.agencies ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span>Grades</span>
              <span className={config.grades ? "text-green-600" : "text-gray-500"}>
                {config.grades ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span>Formations</span>
              <span className={config.trainings ? "text-green-600" : "text-gray-500"}>
                {config.trainings ? "Activé" : "Désactivé"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemTemplates;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getWebhookConfig, updateWebhookConfig } from "@/lib/data-service";

interface WebhookConfigState {
  id: string;
  moduleValidationUrl: string;
  certificationUrl: string;
  classCreationUrl: string;
  applicationWebhookUrl: string;
}

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfigState>({
    id: "default",
    moduleValidationUrl: "",
    certificationUrl: "",
    classCreationUrl: "",
    applicationWebhookUrl: ""
  });

  useEffect(() => {
    loadWebhookConfig();
  }, []);

  const loadWebhookConfig = async () => {
    try {
      const config = await getWebhookConfig();
      setWebhookConfig({
        id: "default",
        moduleValidationUrl: config?.moduleValidationUrl || "",
        certificationUrl: config?.certificationUrl || "",
        classCreationUrl: config?.classCreationUrl || "",
        applicationWebhookUrl: config?.applicationWebhookUrl || ""
      });
    } catch (error) {
      console.error("Error loading webhook config:", error);
    }
  };

  const handleWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateWebhookConfig({
        moduleValidationUrl: webhookConfig.moduleValidationUrl,
        certificationUrl: webhookConfig.certificationUrl,
        classCreationUrl: webhookConfig.classCreationUrl,
        applicationWebhookUrl: webhookConfig.applicationWebhookUrl
      });

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration des webhooks a été sauvegardée avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration des webhooks.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuration des Webhooks</CardTitle>
          <CardDescription>
            Configurez les URLs des webhooks pour les notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWebhookSubmit} className="space-y-4">
            <div>
              <Label htmlFor="moduleValidationUrl">URL de validation des modules</Label>
              <Input
                id="moduleValidationUrl"
                type="url"
                placeholder="https://example.com/module-validation"
                value={webhookConfig.moduleValidationUrl}
                onChange={(e) => setWebhookConfig({
                  ...webhookConfig,
                  moduleValidationUrl: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="certificationUrl">URL de certification</Label>
              <Input
                id="certificationUrl"
                type="url"
                placeholder="https://example.com/certification"
                value={webhookConfig.certificationUrl}
                onChange={(e) => setWebhookConfig({
                  ...webhookConfig,
                  certificationUrl: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="classCreationUrl">URL de création de classe</Label>
              <Input
                id="classCreationUrl"
                type="url"
                placeholder="https://example.com/class-creation"
                value={webhookConfig.classCreationUrl}
                onChange={(e) => setWebhookConfig({
                  ...webhookConfig,
                  classCreationUrl: e.target.value
                })}
              />
            </div>

            <div>
              <Label htmlFor="applicationWebhookUrl">URL de webhook des candidatures</Label>
              <Input
                id="applicationWebhookUrl"
                type="url"
                placeholder="https://example.com/application-webhook"
                value={webhookConfig.applicationWebhookUrl}
                onChange={(e) => setWebhookConfig({
                  ...webhookConfig,
                  applicationWebhookUrl: e.target.value
                })}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

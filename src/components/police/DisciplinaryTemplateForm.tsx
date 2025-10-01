
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DisciplinaryType } from '@/types/police';

interface DisciplinaryTemplateFormProps {
  onSave: (template: {
    title: string;
    type: DisciplinaryType;
    content: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    type: DisciplinaryType;
    content: string;
  };
}

const DisciplinaryTemplateForm: React.FC<DisciplinaryTemplateFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<DisciplinaryType>(initialData?.type || "warning");
  const [content, setContent] = useState(initialData?.content || defaultTemplate);
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez saisir un titre pour ce modèle.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez saisir le contenu de ce modèle.",
        variant: "destructive",
      });
      return;
    }

    onSave({ title, type, content });
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => `${prev} ${variable}`);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-letc-blue text-white">
        <CardTitle>{initialData ? "Modifier le modèle" : "Créer un modèle"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="font-medium text-gray-700">
            Titre du modèle
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du modèle"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="font-medium text-gray-700">
            Type de sanction
          </label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as DisciplinaryType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="reprimand">Réprimande</SelectItem>
              <SelectItem value="suspension">Suspension</SelectItem>
              <SelectItem value="termination">Révocation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-medium text-gray-700">
            Variables disponibles
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{FULL_NAME}}")}
            >
              Nom complet
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{Grade}}")}
            >
              Grade
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{Agencie}}")}
            >
              Agence
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{module}}")}
            >
              Modules
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{FLAGS}}")}
            >
              Dossier disciplinaire
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{Matricule}}")}
            >
              Matricule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{GENERATED_BY}}")}
            >
              Émis par
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{GENERATED_DATE}}")}
            >
              Date d'émission
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertVariable("{{CURRENT_DATE}}")}
            >
              Date actuelle
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="font-medium text-gray-700">
            Contenu du modèle
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="font-mono"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-letc-blue hover:bg-letc-darkblue">
            {initialData ? "Mettre à jour" : "Créer le modèle"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Modèle par défaut avec variables
const defaultTemplate = `RAPPORT DISCIPLINAIRE

Date: {{CURRENT_DATE}}
Émis par: {{GENERATED_BY}}
Date et heure de génération: {{GENERATED_DATE}}

INFORMATIONS DE L'AGENT:
Nom complet: {{FULL_NAME}}
Matricule: {{Matricule}}
Grade: {{Grade}}
Agence: {{Agencie}}

HISTORIQUE DISCIPLINAIRE:
{{FLAGS}}

FORMATIONS COMPLÉTÉES:
{{module}}

DÉCISION:

[Motif de la sanction disciplinaire]

[Description des faits]

[Mesures prises]

Signature: _________________________
`;

export default DisciplinaryTemplateForm;

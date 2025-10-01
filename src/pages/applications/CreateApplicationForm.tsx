

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createApplicationForm } from "@/lib/application-service";
import { FormField as ApplicationFormField, FieldType } from "@/types/police";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateApplicationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<ApplicationFormField[]>([]);

  const createMutation = useMutation({
    mutationFn: (formData: {
      name: string;
      description: string;
      fields: ApplicationFormField[];
      createdBy: string;
      isActive: boolean;
    }) => {
      // Ensure name and description are strings (not undefined)
      return createApplicationForm({
        name: formData.name || "",
        description: formData.description || "",
        fields: formData.fields,
        createdBy: formData.createdBy
      });
    },
    onSuccess: () => {
      toast({
        title: "Formulaire créé",
        description: "Le nouveau formulaire a été créé avec succès"
      });
      navigate("/direction/applications/forms");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le formulaire",
        variant: "destructive"
      });
      console.error("Error creating form:", error);
    }
  });

  const handleAddField = () => {
    const newField: ApplicationFormField = {
      id: uuidv4(),
      label: "",
      type: "text",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleFieldChange = (
    id: string,
    key: string,
    value: string | boolean | string[]
  ) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);
  };

  // Make sure we pass a proper name and description when submitting
  const handleSubmit = () => {
    if (!formTitle) {
      toast({
        title: "Erreur",
        description: "Le titre du formulaire est obligatoire",
        variant: "destructive"
      });
      return;
    }

    // Validate fields have labels
    for (const field of fields) {
      if (!field.label) {
        toast({
          title: "Erreur",
          description: "Tous les champs doivent avoir un libellé",
          variant: "destructive"
        });
        return;
      }
    }

    createMutation.mutate({
      name: formTitle,
      description: formDescription,
      fields,
      createdBy: user?.email || "unknown",
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">
          Créer un Type de Formulaire
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Définissez les informations générales du formulaire de candidature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du formulaire</Label>
            <Input
              id="title"
              placeholder="Titre du formulaire"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description du formulaire"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Champs du formulaire</CardTitle>
          <CardDescription>
            Définissez les champs que les candidats devront remplir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border rounded-md p-4 mb-4"
                        >
                          <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`label-${field.id}`}>Label</Label>
                                <Input
                                  type="text"
                                  id={`label-${field.id}`}
                                  placeholder="Label"
                                  value={field.label}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      field.id,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor={`type-${field.id}`}>Type</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value) =>
                                    handleFieldChange(field.id, "type", value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Texte</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="number">Nombre</SelectItem>
                                    <SelectItem value="textarea">
                                      Zone de texte
                                    </SelectItem>
                                    <SelectItem value="select">
                                      Sélection
                                    </SelectItem>
                                    <SelectItem value="checkbox">
                                      Case à cocher
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {field.type === "select" && (
                              <div>
                                <Label htmlFor={`options-${field.id}`}>
                                  Options (séparées par des virgules)
                                </Label>
                                <Input
                                  type="text"
                                  id={`options-${field.id}`}
                                  placeholder="Option1, Option2, Option3"
                                  value={field.options ? field.options.join(", ") : ""}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      field.id,
                                      "options",
                                      e.target.value.split(",").map(s => s.trim())
                                    )
                                  }
                                />
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`required-${field.id}`}>
                                Requis
                              </Label>
                              <Switch
                                id={`required-${field.id}`}
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  handleFieldChange(field.id, "required", checked)
                                }
                              />
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleRemoveField(field.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleAddField}
          >
            Ajouter un champ
          </Button>
        </CardContent>
      </Card>

      <Button className="bg-letc-blue hover:bg-letc-darkblue" onClick={handleSubmit}>
        Créer le formulaire
      </Button>
    </div>
  );
};

export default CreateApplicationForm;


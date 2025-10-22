import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { getApplicationFormById, updateApplicationForm } from "@/lib/application-service";
import { FormField as ApplicationFormField, FieldType } from "@/types/police";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const EditApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<ApplicationFormField[]>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  // Fetch existing form data
  useEffect(() => {
    const fetchForm = async () => {
      if (!id) {
        setIsLoadingForm(false);
        return;
      }

      try {
        const form = await getApplicationFormById(id);
        if (form) {
          setFormTitle(form.name);
          setFormDescription(form.description || "");
          setFields(form.fields || []);
        } else {
          toast({
            title: "Erreur",
            description: "Formulaire non trouvé",
            variant: "destructive"
          });
          navigate("/applications/forms");
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le formulaire",
          variant: "destructive"
        });
      } finally {
        setIsLoadingForm(false);
      }
    };

    fetchForm();
  }, [id, navigate, toast]);

  const updateMutation = useMutation({
    mutationFn: (formData: {
      name: string;
      description: string;
      fields: ApplicationFormField[];
    }) => {
      return updateApplicationForm(id!, {
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
      });
    },
    onSuccess: () => {
      toast({
        title: "Formulaire modifié",
        description: "Le formulaire a été modifié avec succès"
      });
      navigate("/applications/forms");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le formulaire",
        variant: "destructive"
      });
      console.error("Error updating form:", error);
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

    updateMutation.mutate({
      name: formTitle,
      description: formDescription,
      fields,
    });
  };

  // Loading state
  if (isLoadingForm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement du formulaire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/applications/forms")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">
          Modifier le Formulaire
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Modifiez les informations générales du formulaire de candidature.
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
            Modifiez les champs que les candidats devront remplir.
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

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => navigate("/applications/forms")}
        >
          Annuler
        </Button>
        <Button
          className="bg-letc-blue hover:bg-letc-darkblue"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
};

export default EditApplicationForm;

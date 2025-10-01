import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getApplicationFormById, submitApplication } from "@/lib/application-service";
import { FormField, FieldResponse } from "@/types/police";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Rating } from "@/components/shared/Rating";
import { useToast } from "@/hooks/use-toast";

const PublicApplicationForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Define proper form data types
  interface FormData {
    applicantName: string;
    serverId: string;
    responses: FieldResponse[];
  }
  
  const [formData, setFormData] = useState<FormData>({
    applicantName: "",
    serverId: "",
    responses: []
  });

  // Get the form definition
  const { data: form, isLoading, isError } = useQuery({
    queryKey: ['application-form', formId],
    queryFn: () => formId ? getApplicationFormById(formId) : null,
    enabled: !!formId,
  });

  // Initialize responses when form loads
  useEffect(() => {
    if (form && form.fields.length > 0) {
      const initialResponses = form.fields.map(field => ({
        fieldId: field.id || "",
        label: field.label || "",
        value: "",
        type: field.type || "text",
      }));
      
      setFormData(prev => ({
        ...prev,
        responses: initialResponses
      }));
    }
  }, [form]);

  // Handle form submission
  const submitMutation = useMutation({
    mutationFn: (data: {
      formId: string;
      formName: string;
      applicantName: string;
      serverId: string;
      responses: FieldResponse[];
    }) => submitApplication(data),
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
      toast({
        title: "Candidature soumise",
        description: "Votre candidature a été soumise avec succès."
      });
      navigate("/");
    },
    onError: (err: any) => {
      setError(err.message || "An error occurred while submitting your application.");
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la soumission de votre candidature.",
        variant: "destructive"
      });
    }
  });

  // Handle field changes
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      responses: prev.responses.map(response => 
        response.fieldId === fieldId 
          ? { ...response, value } 
          : response
      )
    }));
  };

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldId: string) => {
    handleFieldChange(fieldId, e.target.value);
  };

  // Handle checkbox change - updating to fix the type error
  const handleCheckboxChange = (checked: boolean, fieldId: string) => {
    handleFieldChange(fieldId, checked ? "true" : "false");
  };

  // Handle rating change
  const handleRatingChange = (value: number, fieldId: string) => {
    handleFieldChange(fieldId, value.toString());
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formId || !form) return;
    
    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required)
      .filter(field => {
        const response = formData.responses.find(r => r.fieldId === field.id);
        return !response || !response.value;
      });
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`);
      toast({
        title: "Erreur",
        description: `Veuillez remplir tous les champs obligatoires: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    // Submit the application
    submitMutation.mutate({
      formId,
      formName: form.name,
      applicantName: formData.applicantName,
      serverId: formData.serverId,
      responses: formData.responses
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement du formulaire...</div>;
  }

  if (isError || !form) {
    return <div className="text-center py-4 text-red-500">Formulaire non trouvé.</div>;
  }

  if (submitted) {
    return <div className="text-center py-4">Votre candidature a été soumise avec succès!</div>;
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="applicantName">Nom complet</Label>
              <Input
                type="text"
                id="applicantName"
                value={formData.applicantName}
                onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serverId">ID Discord</Label>
              <Input
                type="text"
                id="serverId"
                value={formData.serverId}
                onChange={(e) => setFormData(prev => ({ ...prev, serverId: e.target.value }))}
                required
              />
            </div>
            {form.fields.map(field => {
              const response = formData.responses.find(r => r.fieldId === field.id);
              const value = response ? response.value : "";

              switch (field.type) {
                case "text":
                  return (
                    <div className="grid gap-2" key={field.id}>
                      <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                      <Input
                        type="text"
                        id={field.id}
                        value={value}
                        onChange={(e) => handleTextChange(e, field.id)}
                        required={field.required}
                      />
                    </div>
                  );
                case "textarea":
                  return (
                    <div className="grid gap-2" key={field.id}>
                      <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                      <Textarea
                        id={field.id}
                        value={value}
                        onChange={(e) => handleTextChange(e, field.id)}
                        required={field.required}
                      />
                    </div>
                  );
                case "select":
                  return (
                    <div className="grid gap-2" key={field.id}>
                      <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                      <Select onValueChange={(val) => handleFieldChange(field.id, val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || "Sélectionner"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options && field.options.map((option, index) => (
                            <SelectItem key={index} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                case "checkbox":
                  return (
                    <div className="flex items-center space-x-2" key={field.id}>
                      <Checkbox
                        id={field.id}
                        checked={value === "true"}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, field.id)}
                      />
                      <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                    </div>
                  );
                case "rating":
                  return (
                    <div className="grid gap-2" key={field.id}>
                      <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                      <Rating 
                        value={value ? parseInt(value) : 0}
                        onChange={(rating) => handleRatingChange(rating, field.id)}
                      />
                    </div>
                  );
                default:
                  return null;
              }
            })}
            {error && <p className="text-red-500">{error}</p>}
            <Button disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Envoi..." : "Soumettre"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicApplicationForm;

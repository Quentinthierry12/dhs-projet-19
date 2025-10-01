
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createAgency } from "@/lib/police-service";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  acronym: z.string().min(2, "L'acronyme doit contenir au moins 2 caractères"),
  logoUrl: z.string().url("L'URL du logo doit être une URL valide").optional().or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

const AddAgency: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      acronym: "",
      logoUrl: ""
    }
  });
  
  // Create agency mutation
  const createAgencyMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: (agency) => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast({
        title: "Agence créée",
        description: `L'agence ${agency?.name} a été créée avec succès.`,
      });
      navigate(`/police/agencies/${agency?.id}`);
    },
    onError: (error) => {
      console.error("Error creating agency:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'agence. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: FormValues) => {
    createAgencyMutation.mutate({
      name: data.name,
      acronym: data.acronym,
      logoUrl: data.logoUrl || undefined
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/police/agencies")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Ajouter une agence</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle agence</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Los Santos Police Department" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nom complet de l'agence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="acronym"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acronyme</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: LSPD" {...field} />
                    </FormControl>
                    <FormDescription>
                      Abréviation couramment utilisée pour cette agence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du logo</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemple.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optionnel - URL vers l'image du logo de l'agence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/police/agencies")}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={createAgencyMutation.isPending}
                >
                  {createAgencyMutation.isPending ? "Création en cours..." : "Créer l'agence"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAgency;

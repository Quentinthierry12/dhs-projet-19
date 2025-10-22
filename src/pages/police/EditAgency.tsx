import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { getAgencyById, updateAgency, type PoliceAgency } from "@/lib/police-service";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  acronym: z.string().min(2, "L'acronyme doit contenir au moins 2 caractères"),
  logoUrl: z.string().url("L'URL du logo doit être une URL valide").optional().or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

const EditAgency: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [agency, setAgency] = useState<PoliceAgency | null>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(true);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      acronym: "",
      logoUrl: ""
    }
  });

  // Fetch agency data
  useEffect(() => {
    const fetchAgency = async () => {
      if (!id) {
        setIsLoadingAgency(false);
        return;
      }

      try {
        const data = await getAgencyById(id);
        setAgency(data);

        // Populate form with existing data
        form.reset({
          name: data.name,
          acronym: data.acronym,
          logoUrl: data.logoUrl || ""
        });
      } catch (error: any) {
        console.error("Error fetching agency:", error);

        if (error.code === 'PGRST116') {
          toast({
            title: "Erreur",
            description: "Agence non trouvée",
            variant: "destructive"
          });
          navigate("/police/agencies");
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les informations de l'agence",
            variant: "destructive"
          });
        }
      } finally {
        setIsLoadingAgency(false);
      }
    };

    fetchAgency();
  }, [id, navigate, toast, form]);

  // Update agency mutation
  const updateAgencyMutation = useMutation({
    mutationFn: ({ agencyId, data }: { agencyId: string; data: Partial<PoliceAgency> }) =>
      updateAgency(agencyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast({
        title: "Agence modifiée",
        description: "Les modifications ont été enregistrées avec succès"
      });
    },
    onError: (error) => {
      console.error("Error updating agency:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'agence. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    if (!id || !agency) return;

    updateAgencyMutation.mutate({
      agencyId: id,
      data: {
        name: data.name,
        acronym: data.acronym,
        logoUrl: data.logoUrl || undefined
      }
    });
  };

  // Loading state
  if (isLoadingAgency) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement des informations de l'agence...</p>
      </div>
    );
  }

  // Error state (agency not found)
  if (!agency) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Agence non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/police/agencies")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Modifier une agence</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier l'agence</CardTitle>
          <CardDescription>Modifiez les informations de l'agence: {agency.name}</CardDescription>
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
                  disabled={updateAgencyMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateAgencyMutation.isPending ? "Enregistrement en cours..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAgency;

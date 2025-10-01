
import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { getAllPoliceAgencies, createTraining } from "@/lib/police-service";
import { useQuery, useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(100),
  description: z.string().optional(),
  agencyId: z.string().min(1, "Veuillez sélectionner une agence"),
});

type FormValues = z.infer<typeof formSchema>;

const AddTraining: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      agencyId: "",
    },
  });
  
  const { data: agencies = [] } = useQuery({
    queryKey: ['agencies'],
    queryFn: getAllPoliceAgencies,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: FormValues) => createTraining({
      title: data.title,
      description: data.description || '',
      agencyId: data.agencyId
    }),
    onSuccess: () => {
      toast({
        title: "Formation créée",
        description: "La formation a été créée avec succès",
      });
      navigate("/police/trainings");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la formation",
        variant: "destructive",
      });
      console.error("Error creating training:", error);
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    createMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/police/trainings")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Ajouter une formation</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle formation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la formation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Formation au tir" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description détaillée de la formation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agencyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une agence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agencies.length > 0 ? (
                          agencies.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Aucune agence disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/police/trainings")}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Création..." : "Créer la formation"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTraining;

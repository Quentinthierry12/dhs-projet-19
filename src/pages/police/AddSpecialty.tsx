
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

const AddSpecialty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agencyId: ""
  });

  const { data: agencies = [] } = useQuery({
    queryKey: ['agencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dhs_agencies')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const addSpecialtyMutation = useMutation({
    mutationFn: async (specialty: any) => {
      const { data, error } = await supabase
        .from('dhs_specialties')
        .insert({
          name: specialty.name,
          description: specialty.description,
          agency_id: specialty.agencyId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Spécialité ajoutée",
        description: "La spécialité a été ajoutée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
      navigate('/police/specialties');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la spécialité.",
        variant: "destructive",
      });
      console.error('Error adding specialty:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.agencyId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    addSpecialtyMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/police/specialties')}
            className="w-fit"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-letc-blue">
            Ajouter une spécialité
          </h1>
        </div>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Nouvelle spécialité</CardTitle>
            <CardDescription className="text-sm">
              Ajoutez une nouvelle spécialité à une agence.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencyId" className="text-sm">Agence *</Label>
                  <Select 
                    value={formData.agencyId} 
                    onValueChange={(value) => setFormData({ ...formData, agencyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Nom de la spécialité *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Unité spéciale..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la spécialité..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="bg-letc-blue hover:bg-letc-darkblue text-sm"
                  disabled={addSpecialtyMutation.isPending}
                  size="sm"
                >
                  {addSpecialtyMutation.isPending ? "Ajout..." : "Ajouter la spécialité"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/police/specialties')}
                  size="sm"
                  className="text-sm"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddSpecialty;

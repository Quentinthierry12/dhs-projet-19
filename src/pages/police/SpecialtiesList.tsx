
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Building, Trash2 } from "lucide-react";

const SpecialtiesList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: specialties = [], isLoading } = useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dhs_specialties')
        .select(`
          *,
          dhs_agencies(name, acronym)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const deleteSpecialtyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dhs_specialties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Spécialité supprimée",
        description: "La spécialité a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['specialties'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la spécialité.",
        variant: "destructive",
      });
      console.error('Error deleting specialty:', error);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-letc-blue">
            Spécialités
          </h1>
          <Button onClick={() => navigate('/police/specialties/add')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une spécialité
          </Button>
        </div>

        {specialties.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-lg sm:text-xl text-gray-500 mb-4">Aucune spécialité trouvée.</p>
            <Button onClick={() => navigate('/police/specialties/add')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la première spécialité
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {specialties.map((specialty) => (
              <Card key={specialty.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg break-words">
                        {specialty.name}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {specialty.dhs_agencies?.name || 'Agence inconnue'}
                        </div>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
                          deleteSpecialtyMutation.mutate(specialty.id);
                        }
                      }}
                      disabled={deleteSpecialtyMutation.isPending}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {specialty.description && (
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {specialty.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialtiesList;

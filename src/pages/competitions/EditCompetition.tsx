
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

const EditCompetition = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('EditCompetition - Competition ID from params:', id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "externe",
    specialty: "",
    maxScore: 100,
    startDate: "",
    endDate: "",
    isActive: true,
    isEntryTest: false
  });

  const { data: competition, isLoading, error } = useQuery({
    queryKey: ['competition', id],
    queryFn: async () => {
      console.log('Fetching competition with ID:', id);
      
      if (!id) {
        throw new Error('No competition ID provided');
      }

      const { data, error } = await supabase
        .from('dhs_competitions')
        .select('*')
        .eq('id', id)
        .single();

      console.log('Competition fetch result:', { data, error });

      if (error) {
        console.error('Error fetching competition:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (competition) {
      console.log('Setting form data from competition:', competition);
      setFormData({
        title: competition.title || "",
        description: competition.description || "",
        type: competition.type || "externe",
        specialty: competition.specialty || "",
        maxScore: competition.max_score || 100,
        startDate: competition.start_date ? new Date(competition.start_date).toISOString().slice(0, 16) : "",
        endDate: competition.end_date ? new Date(competition.end_date).toISOString().slice(0, 16) : "",
        isActive: competition.is_active ?? true,
        isEntryTest: competition.is_entry_test ?? false
      });
    }
  }, [competition]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating competition with data:', data);
      
      const { error } = await supabase
        .from('dhs_competitions')
        .update({
          title: data.title,
          description: data.description,
          type: data.type,
          specialty: data.specialty,
          max_score: data.maxScore,
          start_date: data.startDate ? new Date(data.startDate).toISOString() : null,
          end_date: data.endDate ? new Date(data.endDate).toISOString() : null,
          is_active: data.isActive,
          is_entry_test: data.isEntryTest,
          updated_at: new Date().toISOString()
        })
        .eq('id', id!);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Concours modifié",
        description: "Le concours a été modifié avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['competition', id] });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      navigate(`/direction/competitions`);
    },
    onError: (error) => {
      console.error('Error updating competition:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le concours.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.specialty) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Chargement...</h2>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    console.error('Competition not found or error:', { error, competition, id });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold">Concours introuvable</h2>
          <p className="text-sm text-gray-600 mt-2">ID: {id}</p>
          <Button onClick={() => navigate('/direction/competitions')} className="mt-4" size="sm">
            Retour aux concours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/direction/competitions')}
            className="w-fit"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-letc-blue">
            Modifier le concours
          </h1>
        </div>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Informations du concours</CardTitle>
            <CardDescription className="text-sm">
              Modifiez les informations de ce concours.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre du concours"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty" className="text-sm">Spécialité *</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Police, Pompier, SAMU..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">Type de concours</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="externe">Externe</SelectItem>
                      <SelectItem value="interne">Interne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore" className="text-sm">Score maximum</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm">Date de début</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du concours..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm">Concours actif</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEntryTest"
                    checked={formData.isEntryTest}
                    onCheckedChange={(checked) => setFormData({ ...formData, isEntryTest: checked })}
                  />
                  <Label htmlFor="isEntryTest" className="text-sm">Test d'entrée</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="bg-letc-blue hover:bg-letc-darkblue text-sm"
                  disabled={updateMutation.isPending}
                  size="sm"
                >
                  {updateMutation.isPending ? "Modification..." : "Modifier le concours"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/direction/competitions')}
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

export default EditCompetition;

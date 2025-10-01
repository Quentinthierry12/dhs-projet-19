
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Home, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CompetitionLogin = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: agents = [] } = useQuery({
    queryKey: ['police-agents', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('dhs_police_agents')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,badge_number.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
  };

  const handleSelectAgent = (agent: any) => {
    // Rediriger vers la page de participation avec les informations de l'agent
    navigate(`/competition/${competitionId}/participate`, {
      state: { 
        isInternal: true,
        participantId: agent.badge_number,
        participantName: agent.name
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-letc-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔐 Connexion Concours Interne</h1>
              <p className="text-letc-blue-light">Recherchez votre profil par RIO ou Nom.Prénom</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white text-letc-blue hover:bg-gray-100"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Rechercher votre profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="search">RIO ou Nom.Prénom</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ex: 12345 ou Dupont.Jean"
                      required
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Résultats de recherche */}
              {searchTerm.length >= 2 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">Résultats de recherche :</h3>
                  {agents.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucun agent trouvé</p>
                  ) : (
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSelectAgent(agent)}
                        >
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-500">RIO: {agent.badge_number}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompetitionLogin;

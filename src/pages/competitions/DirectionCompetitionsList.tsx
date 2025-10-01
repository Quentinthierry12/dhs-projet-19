
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllCompetitions } from "@/lib/competition-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Calendar, Users, FileText, UserPlus, Settings } from "lucide-react";

const DirectionCompetitionsList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['direction-competitions'],
    queryFn: () => getAllCompetitions(),
  });

  const publicCompetitions = competitions.filter(comp => comp.type !== 'privé');
  const privateCompetitions = competitions.filter(comp => comp.type === 'privé');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'externe': return 'bg-blue-500';
      case 'interne': return 'bg-green-500';
      case 'privé': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const CompetitionCard = ({ competition }: { competition: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{competition.title}</CardTitle>
            <CardDescription className="mt-1">
              {competition.description || "Aucune description"}
            </CardDescription>
          </div>
          <Badge className={`${getTypeColor(competition.type)} text-white`}>
            {competition.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            <p>Score max: {competition.maxScore} points</p>
            {competition.specialty && <p>Spécialité: {competition.specialty}</p>}
            {competition.isEntryTest && (
              <Badge variant="secondary" className="mt-1">Test d'entrée LETC</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/direction/competitions/${competition.id}/edit`)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Modifier
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/direction/competitions/${competition.id}/questions`)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Questions
            </Button>

            {competition.type === 'privé' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/direction/competitions/${competition.id}/invitations`)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Gestion des participants
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/direction/competitions/${competition.id}/correct`)}
            >
              <Settings className="h-3 w-3 mr-1" />
              Corriger
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Chargement des concours...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-letc-blue">Gestion des concours</h1>
          <p className="text-gray-600">Créez et gérez les concours de formation</p>
        </div>
        <Button onClick={() => navigate('/direction/competitions/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau concours
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous les concours ({competitions.length})</TabsTrigger>
          <TabsTrigger value="public">Concours publics ({publicCompetitions.length})</TabsTrigger>
          <TabsTrigger value="private">Concours privés ({privateCompetitions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {competitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">Aucun concours créé pour le moment.</p>
                <Button onClick={() => navigate('/direction/competitions/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier concours
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {publicCompetitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucun concours public pour le moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Concours privés</h3>
            <p className="text-purple-700 text-sm">
              Les concours privés nécessitent des invitations avec identifiants de connexion uniques. 
              Utilisez la "Gestion des participants" pour créer et gérer les invitations.
            </p>
          </div>

          {privateCompetitions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucun concours privé pour le moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/direction/competitions/results')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Voir les résultats
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/direction/competitions/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un concours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectionCompetitionsList;

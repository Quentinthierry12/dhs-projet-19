
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPublicCompetitions } from "@/lib/competition-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Users, Home } from "lucide-react";

const CompetitionsList = () => {
  const navigate = useNavigate();

  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['competitions-public'],
    queryFn: () => getPublicCompetitions(true),
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement des concours...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-letc-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧪 Concours LETC</h1>
              <p className="text-letc-blue-light">Participez aux concours de recrutement</p>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🎓 Types de concours</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Concours Externe
                </CardTitle>
                <CardDescription>
                  Ouvert au public - Aucune identification requise
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Concours Interne
                </CardTitle>
                <CardDescription>
                  Réservé aux agents connectés (RIO ou Nom.Prénom)
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">Aucun concours disponible actuellement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                    <Badge 
                      variant={competition.type === 'externe' ? 'default' : 'secondary'}
                      className={competition.type === 'externe' ? 'bg-green-500' : 'bg-blue-500'}
                    >
                      {competition.type === 'externe' ? (
                        <>
                          <Users className="h-3 w-3 mr-1" />
                          Externe
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Interne
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardDescription>{competition.description}</CardDescription>
                  {competition.specialty && (
                    <div className="text-sm text-gray-600">
                      <strong>Spécialité:</strong> {competition.specialty}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <strong>Note sur:</strong> {competition.maxScore}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (competition.type === 'interne') {
                        navigate(`/competition/${competition.id}/login`);
                      } else {
                        navigate(`/competition/${competition.id}/participate`);
                      }
                    }}
                  >
                    {competition.type === 'externe' ? 'Participer' : 'Se connecter pour participer'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionsList;

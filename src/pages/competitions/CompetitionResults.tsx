
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCompetitionResults } from "@/lib/competition-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Home, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

const CompetitionResults = () => {
  const navigate = useNavigate();

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['competition-results'],
    queryFn: getCompetitionResults,
  });

  console.log('Competition results:', results);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Chargement des résultats...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Impossible de charger les résultats des concours</p>
          <Button onClick={() => navigate('/direction/competitions')}>
            Retour aux concours
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (result: any) => {
    if (result.status === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Acceptée
        </Badge>
      );
    } else if (result.status === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Refusée
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/direction/competitions')}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux concours
            </Button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-letc-blue">
              Résultats des Concours
            </h1>
            <p className="text-gray-600 mt-1">
              {results.length} résultat{results.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>

        {/* Results List */}
        {results.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Aucun résultat disponible</h3>
                <p className="text-gray-500 mb-4">
                  Les résultats des concours apparaîtront ici une fois les copies corrigées.
                </p>
                <Button onClick={() => navigate('/direction/competitions')}>
                  Voir les concours
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={result.id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg break-words">
                        {result.competitionTitle}
                      </CardTitle>
                      <CardDescription className="flex flex-col gap-1">
                        <span>Participant: {result.participantName}</span>
                        {result.participantRio && (
                          <span>RIO: {result.participantRio}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(result)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.score || 0}
                      </div>
                      <div className="text-sm text-gray-600">Points obtenus</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {result.maxScore || 0}
                      </div>
                      <div className="text-sm text-gray-600">Points maximum</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.percentage || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Pourcentage</div>
                    </div>
                  </div>

                  {result.comment && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Commentaire du correcteur:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {result.comment}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                    <div className="text-xs text-gray-500">
                      Soumis le: {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Date inconnue'}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/direction/competitions/${result.competitionId}/correct`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir la copie
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionResults;

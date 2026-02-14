
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCandidates, getClasses, calculateCandidateProgress } from "@/lib/data-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Users, School, Award, TrendingUp, Chrome as Home, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: getCandidates,
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  // Calculate statistics
  const totalCandidates = candidates.length;
  const totalClasses = classes.length;
  const certifiedCandidates = candidates.filter(candidate => candidate.isCertified).length;
  const activeCandidates = candidates.filter(candidate => !candidate.isCertified).length;

  return (
    <div className="space-y-6">
      {/* Header amélioré avec bouton home */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-letc-blue mb-2">
              Tableau de bord USSS
            </h1>
            <p className="text-gray-600">
              Aperçu complet de la formation et des candidats
            </p>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="flex gap-2">
          <Link to="/candidates/add">
            <Button className="bg-letc-blue hover:bg-letc-darkblue">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Candidat
            </Button>
          </Link>
          <Link to="/classes/add">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Classe
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidats</CardTitle>
            <Users className="h-4 w-4 text-letc-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-letc-blue">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCandidates} en formation
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Actives</CardTitle>
            <School className="h-4 w-4 text-letc-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-letc-blue">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions en cours
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidats Certifiés</CardTitle>
            <Award className="h-4 w-4 text-letc-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-letc-green">{certifiedCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCandidates > 0 ? Math.round((certifiedCandidates / totalCandidates) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-letc-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-letc-blue">
              {totalCandidates > 0 ? Math.round((certifiedCandidates / totalCandidates) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance globale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates and Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-letc-blue to-letc-darkblue text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidats Récents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingCandidates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto mb-4"></div>
                <p>Chargement...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium mb-2">Aucun candidat</p>
                <Link to="/candidates/add">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un candidat
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {candidates.slice(0, 5).map((candidate) => (
                  <CandidateProgressCard key={candidate.id} candidate={candidate} />
                ))}
                
                {candidates.length > 5 && (
                  <div className="p-4 text-center bg-gray-50">
                    <Link 
                      to="/candidates" 
                      className="text-letc-blue hover:underline font-medium"
                    >
                      Voir tous les candidats ({candidates.length}) →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-letc-blue to-letc-darkblue text-white">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Classes Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingClasses ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto mb-4"></div>
                <p>Chargement...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium mb-2">Aucune classe</p>
                <Link to="/classes/add">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une classe
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {classes.slice(0, 5).map((classItem) => (
                  <div key={classItem.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <Link 
                          to={`/classes/${classItem.id}`}
                          className="font-medium hover:text-letc-blue transition-colors block"
                        >
                          {classItem.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Instructeur: {classItem.instructorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {classItem.candidateIds.length} candidat{classItem.candidateIds.length !== 1 && 's'}
                        </p>
                      </div>
                      <Badge 
                        className={classItem.status === 'active' ? 'bg-letc-green' : 'bg-gray-500'}
                      >
                        {classItem.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {classes.length > 5 && (
                  <div className="p-4 text-center bg-gray-50">
                    <Link 
                      to="/classes" 
                      className="text-letc-blue hover:underline font-medium"
                    >
                      Voir toutes les classes ({classes.length}) →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Component for displaying candidate progress
const CandidateProgressCard: React.FC<{ candidate: any }> = ({ candidate }) => {
  const { data: progress } = useQuery({
    queryKey: ['candidate-progress', candidate.id],
    queryFn: () => calculateCandidateProgress(candidate),
    initialData: { totalScore: 0, maxPossibleScore: 100, percentage: 0 }
  });

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/candidates/${candidate.id}`}
              className="font-medium hover:text-letc-blue transition-colors"
            >
              {candidate.name}
            </Link>
            <Badge variant="outline" className="text-xs">#{candidate.serverId}</Badge>
            {candidate.isCertified && (
              <Badge className="bg-letc-green text-white">
                <Award className="h-3 w-3 mr-1" />
                Certifié
              </Badge>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Progression</span>
              <span className="text-xs text-gray-600">
                {progress.totalScore} / {progress.maxPossibleScore} pts
              </span>
            </div>
            <ProgressBar
              value={progress.totalScore}
              max={progress.maxPossibleScore}
              showPercent
              size="sm"
              className="h-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

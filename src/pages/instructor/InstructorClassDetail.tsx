
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  getClassById, 
  getCandidatesByClassId,
  calculateCandidateProgress
} from "@/lib/data-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { 
  ChevronLeft, 
  Users, 
  School, 
  Calendar,
  Eye,
  Award 
} from "lucide-react";
import { Link } from "react-router-dom";

const InstructorClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch class details
  const { 
    data: classData, 
    isLoading: isLoadingClass,
    error: classError 
  } = useQuery({
    queryKey: ['class', id],
    queryFn: () => id ? getClassById(id) : Promise.resolve(undefined),
    enabled: !!id,
  });

  // Fetch candidates for this class
  const { 
    data: candidates = [], 
    isLoading: isLoadingCandidates 
  } = useQuery({
    queryKey: ['class-candidates', id],
    queryFn: () => id ? getCandidatesByClassId(id) : Promise.resolve([]),
    enabled: !!id,
  });

  if (isLoadingClass) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
      </div>
    );
  }

  if (classError || !classData) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Classe introuvable</h2>
        <p className="mt-2 text-gray-500">La classe demandée n'existe pas ou a été supprimée</p>
        <Link to="/instructor/classes">
          <Button className="mt-4">
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/instructor/classes")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-letc-blue">{classData.name}</h1>
          <Badge>{classData.status}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom de la classe</p>
                <p>{classData.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Instructeur</p>
                <p>{classData.instructorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <Badge>{classData.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date de création</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(classData.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Candidats</p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {candidates.length} candidat{candidates.length !== 1 && 's'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Candidats de la classe</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCandidates ? (
                <p className="text-center py-6">Chargement des candidats...</p>
              ) : candidates.length > 0 ? (
                <div className="divide-y">
                  {candidates.map(candidate => (
                    <CandidateRow key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">
                  Aucun candidat dans cette classe
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Component for displaying individual candidate row
const CandidateRow: React.FC<{ candidate: any }> = ({ candidate }) => {
  const { data: progress } = useQuery({
    queryKey: ['candidate-progress', candidate.id],
    queryFn: () => calculateCandidateProgress(candidate),
    initialData: { totalScore: 0, maxPossibleScore: 100, percentage: 0 }
  });

  return (
    <div className="py-4 flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">{candidate.name}</h3>
          <Badge variant="outline">#{candidate.serverId}</Badge>
          {candidate.isCertified && (
            <Badge className="bg-letc-green">
              <Award className="h-3 w-3 mr-1" />
              Certifié
            </Badge>
          )}
        </div>
        
        <div className="mt-2 max-w-xs">
          <ProgressBar
            value={progress.totalScore}
            max={progress.maxPossibleScore}
            showPercent
            size="sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Progression: {progress.percentage}%
          </p>
        </div>
      </div>
      
      <Link to={`/candidates/${candidate.id}`}>
        <Button variant="ghost" size="sm" className="text-letc-blue">
          <Eye className="h-4 w-4 mr-2" />
          Voir le profil
        </Button>
      </Link>
    </div>
  );
};

export default InstructorClassDetail;

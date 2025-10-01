import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getModules, getCandidates } from "@/lib/data-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Home, Award, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/shared/ProgressBar";

const TrainingResultsPage = () => {
  const [search, setSearch] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates-with-scores'],
    queryFn: getCandidates,
    enabled: searchTriggered && search.length >= 2,
  });

  const handleSearch = () => {
    if (search.length >= 2) {
      setSearchTriggered(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchTerm = search.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(searchTerm) ||
      candidate.serverId.toLowerCase().includes(searchTerm)
    );
  });

  const getModuleResults = (candidate: any) => {
    console.log('Getting module results for candidate:', candidate);
    console.log('Candidate moduleScores:', candidate.moduleScores);
    console.log('Available modules:', modules);
    
    if (!candidate.moduleScores || candidate.moduleScores.length === 0) {
      console.log('No module scores found for candidate');
      return [];
    }

    const moduleMap = new Map();
    
    candidate.moduleScores.forEach((score: any) => {
      console.log('Processing score:', score);
      
      const subModule = modules
        .flatMap(m => m.subModules || [])
        .find(sm => sm.id === score.subModuleId);
      
      console.log('Found subModule:', subModule);
      
      if (subModule) {
        const module = modules.find(m => m.id === subModule.moduleId);
        console.log('Found module:', module);
        
        if (module) {
          if (!moduleMap.has(module.id)) {
            moduleMap.set(module.id, {
              moduleName: module.name,
              scores: [],
              totalScore: 0,
              maxScore: 0
            });
          }
          
          const moduleData = moduleMap.get(module.id);
          moduleData.scores.push({
            subModuleName: subModule.name,
            score: score.score,
            maxScore: score.maxScore,
            comment: score.comment,
            instructorId: score.instructorId
          });
          moduleData.totalScore += score.score;
          moduleData.maxScore += score.maxScore;
        }
      }
    });

    const results = Array.from(moduleMap.values());
    console.log('Final module results:', results);
    return results;
  };

  const calculateOverallProgress = (candidate: any) => {
    if (!candidate.moduleScores || candidate.moduleScores.length === 0) {
      return { percentage: 0, totalScore: 0, maxScore: 0 };
    }

    const totalScore = candidate.moduleScores.reduce((sum: number, score: any) => sum + score.score, 0);
    const maxScore = candidate.moduleScores.reduce((sum: number, score: any) => sum + score.maxScore, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return { percentage, totalScore, maxScore };
  };

  const isLoading = modulesLoading || candidatesLoading;

  return (
    <div className="space-y-6">
      {/* Header avec bouton home */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-letc-blue">Résultats de Formation</h1>
            <p className="text-gray-600">Consultez les résultats détaillés des formations FLETC</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span>{modules.length} modules disponibles</span>
        </div>
      </div>

      {/* Carte de recherche améliorée */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-letc-blue to-letc-darkblue text-white">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher des Résultats de Formation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Nom du candidat ou ID serveur
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Entrez au moins 2 caractères pour rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={search.length < 2}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {!searchTriggered && (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Recherche de Résultats de Formation</p>
              <p>Entrez un nom ou ID serveur pour consulter les résultats détaillés</p>
            </div>
          )}

          {searchTriggered && (
            <>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto mb-4"></div>
                  <p>Chargement des résultats...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
                  <p>Aucun candidat ne correspond à "{search}"</p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {filteredCandidates.length} candidat{filteredCandidates.length !== 1 ? 's' : ''} trouvé{filteredCandidates.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {filteredCandidates.map((candidate) => {
                    const moduleResults = getModuleResults(candidate);
                    const overallProgress = calculateOverallProgress(candidate);
                    
                    return (
                      <Card key={candidate.id} className="shadow-md">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">{candidate.name}</CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  #{candidate.serverId}
                                </Badge>
                                {candidate.isCertified && (
                                  <Badge className="bg-letc-green text-white">
                                    <Award className="h-3 w-3 mr-1" />
                                    Certifié
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Barre de progression globale */}
                              {overallProgress.maxScore > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Progression Globale
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {overallProgress.totalScore} / {overallProgress.maxScore} points
                                    </span>
                                  </div>
                                  <ProgressBar
                                    value={overallProgress.totalScore}
                                    max={overallProgress.maxScore}
                                    showPercent
                                    className="h-3"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {moduleResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <BookOpen className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                              <p className="font-medium">Aucun résultat de formation disponible</p>
                              <p className="text-sm">Ce candidat n'a pas encore de scores enregistrés</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {moduleResults.map((moduleResult, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                      <BookOpen className="h-4 w-4 text-letc-blue" />
                                      {moduleResult.moduleName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-sm">
                                        {moduleResult.totalScore} / {moduleResult.maxScore} points
                                      </Badge>
                                      <Badge 
                                        className={
                                          moduleResult.maxScore > 0 && (moduleResult.totalScore / moduleResult.maxScore) >= 0.7 
                                            ? "bg-letc-green" 
                                            : "bg-red-500"
                                        }
                                      >
                                        {moduleResult.maxScore > 0 ? Math.round((moduleResult.totalScore / moduleResult.maxScore) * 100) : 0}%
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-white">
                                          <TableHead className="font-semibold">Sous-module</TableHead>
                                          <TableHead className="font-semibold">Score</TableHead>
                                          <TableHead className="font-semibold">Instructeur</TableHead>
                                          <TableHead className="font-semibold">Commentaire</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {moduleResult.scores.map((score, scoreIndex) => (
                                          <TableRow key={scoreIndex} className="bg-white">
                                            <TableCell className="font-medium">
                                              {score.subModuleName}
                                            </TableCell>
                                            <TableCell>
                                              <Badge 
                                                variant={score.maxScore > 0 && score.score >= score.maxScore * 0.7 ? "default" : "destructive"}
                                                className="font-mono"
                                              >
                                                {score.score} / {score.maxScore}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              {score.instructorId ? (
                                                <span className="text-sm">{score.instructorId}</span>
                                              ) : (
                                                <span className="text-gray-400 text-sm">Non assigné</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {score.comment ? (
                                                <span className="text-sm">{score.comment}</span>
                                              ) : (
                                                <span className="text-gray-400 text-sm">Aucun commentaire</span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingResultsPage;

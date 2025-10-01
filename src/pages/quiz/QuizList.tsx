
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "@/lib/quiz-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Users, BarChart3, Play, Clock } from "lucide-react";

const QuizList = () => {
  const navigate = useNavigate();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Chargement des quiz...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Gestion des Quiz</h1>
        <Button 
          onClick={() => navigate('/quiz/create')}
          className="bg-letc-blue hover:bg-letc-darkblue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Aucun quiz créé</h3>
              <p className="text-gray-500 mb-4">
                Commencez par créer votre premier quiz d'évaluation.
              </p>
              <Button onClick={() => navigate('/quiz/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg break-words">{quiz.title}</CardTitle>
                  <Badge variant={quiz.isActive ? "default" : "secondary"}>
                    {quiz.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {quiz.description && (
                    <p className="mb-2">{quiz.description}</p>
                  )}
                  {quiz.moduleName && (
                    <p><strong>Module:</strong> {quiz.moduleName}</p>
                  )}
                  {quiz.subModuleName && (
                    <p><strong>Sous-module:</strong> {quiz.subModuleName}</p>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-bold text-blue-600">{quiz.maxScore}</div>
                    <div className="text-gray-600">Points max</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-600 flex items-center justify-center">
                      {quiz.timeLimit ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {quiz.timeLimit}min
                        </>
                      ) : (
                        "Illimité"
                      )}
                    </div>
                    <div className="text-gray-600">Durée</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/quiz/${quiz.id}/participants`)}
                    className="flex-1"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Participants
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                    className="flex-1"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Résultats
                  </Button>
                </div>

                <div className="mt-3">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate(`/quiz/${quiz.id}/participate`)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!quiz.isActive}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Aperçu du Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;


import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCompetitionById, getCompetitionQuestions, submitParticipation, isCompetitionActive } from "@/lib/competition-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Home, Send, Clock } from "lucide-react";

const CompetitionParticipate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { competitionId } = useParams();
  const { toast } = useToast();
  const [participantInfo, setParticipantInfo] = useState({
    name: location.state?.participantName || "",
    rio: location.state?.participantId || ""
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const { data: competition } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: () => getCompetitionById(competitionId!),
    enabled: !!competitionId,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['competition-questions', competitionId],
    queryFn: () => getCompetitionQuestions(competitionId!),
    enabled: !!competitionId,
  });

  const submitMutation = useMutation({
    mutationFn: submitParticipation,
    onSuccess: () => {
      toast({
        title: "Participation soumise",
        description: "Votre participation a été enregistrée avec succès."
      });
      navigate('/results');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la soumission.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!competition || !competitionId) return;

    // Check if competition is active
    if (!isCompetitionActive(competition)) {
      toast({
        title: "Concours fermé",
        description: "Ce concours n'est plus disponible.",
        variant: "destructive"
      });
      return;
    }

    const submissionAnswers = questions
      .filter(question => question.type !== 'section')
      .map(question => ({
        questionId: question.id,
        answer: answers[question.id] || '',
        score: 0,
        maxScore: question.maxPoints
      }));

    submitMutation.mutate({
      competitionId,
      participantName: participantInfo.name,
      participantRio: participantInfo.rio,
      answers: submissionAnswers
    });
  };

  if (!competition) {
    return <div className="text-center py-8">Concours introuvable...</div>;
  }

  // Check if competition is active
  if (!isCompetitionActive(competition)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Concours fermé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Ce concours n'est plus disponible.
            </p>
            {competition.startDate && new Date() < new Date(competition.startDate) && (
              <p className="text-sm text-gray-500">
                Début prévu le {new Date(competition.startDate).toLocaleDateString('fr-FR')} à {new Date(competition.startDate).toLocaleTimeString('fr-FR')}
              </p>
            )}
            {competition.endDate && new Date() > new Date(competition.endDate) && (
              <p className="text-sm text-gray-500">
                Concours terminé le {new Date(competition.endDate).toLocaleDateString('fr-FR')} à {new Date(competition.endDate).toLocaleTimeString('fr-FR')}
              </p>
            )}
            <Button onClick={() => navigate('/')} className="w-full mt-4">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-letc-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">📝 {competition.title}</h1>
              {competition.description && (
                <div 
                  className="text-letc-blue-light prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: competition.description }}
                />
              )}
              {competition.endDate && (
                <div className="mt-2 text-sm opacity-90">
                  ⏰ Fin du concours : {new Date(competition.endDate).toLocaleDateString('fr-FR')} à {new Date(competition.endDate).toLocaleTimeString('fr-FR')}
                </div>
              )}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Participant Info */}
          {competition.type === 'externe' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations du participant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={participantInfo.name}
                    onChange={(e) => setParticipantInfo({ ...participantInfo, name: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          {questions.map((question, index) => {
            if (question.type === 'section') {
              return (
                <Card key={question.id} className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">{question.question}</CardTitle>
                  </CardHeader>
                </Card>
              );
            }

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Question {index + 1}</span>
                    <span className="text-sm font-normal">({question.maxPoints} points)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{question.question}</p>
                    
                    {question.type === 'qcm' && question.options ? (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                            <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        placeholder="Votre réponse..."
                        rows={4}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button 
            type="submit" 
            disabled={submitMutation.isPending}
            className="w-full"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? 'Soumission...' : 'Soumettre ma participation'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompetitionParticipate;

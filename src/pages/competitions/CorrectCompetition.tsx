import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertTriangle, Home, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Define types for better TypeScript support
interface Competition {
  id: string;
  title: string;
  description?: string;
  type: string;
  is_entry_test: boolean;
  max_score: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  competition_id: string;
  question: string;
  type: string;
  max_points: number;
  order_number: number;
}

interface Participation {
  id: string;
  competition_id: string;
  participant_name: string;
  participant_rio?: string;
  answers: any[];
  total_score: number;
  max_possible_score: number;
  status: string;
  submitted_at: string;
}

// Define a schema for the answer form
const answerSchema = z.object({
  score: z.number().optional(),
  comment: z.string().optional(),
});

// Helper function to safely parse answers
const parseAnswers = (answers: any): any[] => {
  if (Array.isArray(answers)) {
    return answers;
  }
  if (typeof answers === 'string') {
    try {
      const parsed = JSON.parse(answers);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing answers:', error);
      return [];
    }
  }
  return [];
};

const CorrectCompetition = () => {
  const { id: competitionId } = useParams();
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const queryClient = useQueryClient();

  // State for editing scores and comments
  const [editedAnswers, setEditedAnswers] = useState<Record<string, {score: number, comment: string}>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const [currentEditingParticipation, setCurrentEditingParticipation] = useState<Participation | null>(null);

  console.log('Competition ID from params:', competitionId);

  // Fetch competition details
  const { data: competition, isLoading: isCompetitionLoading, error: competitionError } = useQuery({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      if (!competitionId) {
        throw new Error("ID de compétition manquant");
      }
      
      console.log('Fetching competition with ID:', competitionId);
      
      const { data, error } = await supabase
        .from("dhs_competitions")
        .select("*")
        .eq("id", competitionId)
        .single();
      
      if (error) {
        console.error('Error fetching competition:', error);
        throw new Error(`Erreur lors du chargement de la compétition: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Compétition non trouvée");
      }
      
      console.log('Competition fetched successfully:', data);
      return data as Competition;
    },
    enabled: !!competitionId,
  });

  // Fetch questions related to the competition
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } = useQuery({
    queryKey: ["competitionQuestions", competitionId],
    queryFn: async () => {
      if (!competitionId) {
        throw new Error("ID de compétition manquant");
      }
      
      console.log('Fetching questions for competition:', competitionId);
      
      const { data, error } = await supabase
        .from("dhs_competition_questions")
        .select("*")
        .eq("competition_id", competitionId)
        .order("order_number");
      
      if (error) {
        console.error('Error fetching questions:', error);
        throw new Error(`Erreur lors du chargement des questions: ${error.message}`);
      }
      
      console.log('Questions fetched successfully:', data);
      return data as Question[];
    },
    enabled: !!competitionId,
  });

  // Fetch participations for the competition
  const { data: participations, isLoading: isParticipationsLoading, refetch, error: participationsError } = useQuery({
    queryKey: ["competitionParticipations", competitionId],
    queryFn: async () => {
      if (!competitionId) {
        throw new Error("ID de compétition manquant");
      }
      
      console.log('Fetching participations for competition:', competitionId);
      
      const { data, error } = await supabase
        .from("dhs_competition_participations")
        .select("*")
        .eq("competition_id", competitionId)
        .order("submitted_at", { ascending: false });
      
      if (error) {
        console.error('Error fetching participations:', error);
        throw new Error(`Erreur lors du chargement des participations: ${error.message}`);
      }
      
      console.log('Participations fetched successfully:', data);
      return data as Participation[];
    },
    enabled: !!competitionId,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('Fetching webhook settings...');
        
        const { data, error } = await supabase
          .from('dhs_webhook_config')
          .select('config')
          .eq('id', 'default')
          .maybeSingle();

        if (error) {
          console.error('Error fetching webhook settings:', error);
          return;
        }

        if (data?.config && typeof data.config === 'object' && 'discord_webhook_url' in data.config) {
          setDiscordWebhookUrl(data.config.discord_webhook_url as string);
          console.log('Webhook URL configured successfully');
        } else {
          console.log('No webhook configuration found, continuing without Discord notifications');
        }
      } catch (error) {
        console.error('Unexpected error fetching webhook settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleAcceptParticipation = async (participationId: string) => {
    if (!competition || !participations || !questions) return;
    
    try {
      const participation = participations.find(p => p.id === participationId);
      if (!participation) return;

      // Parse answers safely
      const answers = parseAnswers(participation.answers);
      
      let totalScore = 0;
      const scoredAnswers = answers.map((answer: any) => {
        const question = questions.find(q => q.id === answer.questionId);
        const score = typeof answer.score === 'number' ? answer.score : 0;
        totalScore += score;
        
        return {
          ...answer,
          score,
          comment: typeof answer.comment === 'string' ? answer.comment : ''
        };
      });

      // Update participation status to accepted
      const { error: updateError } = await supabase
        .from('dhs_competition_participations')
        .update({ 
          status: 'accepted',
          total_score: totalScore,
          answers: scoredAnswers
        })
        .eq('id', participationId);

      if (updateError) throw updateError;

      // If it's an entry test, create a candidate
      if (competition.is_entry_test) {
        const { error: candidateError } = await supabase
          .from('dhs_candidates')
          .insert({
            name: participation.participant_name,
            server_id: participation.participant_rio || `LETC-${Date.now()}`,
            is_certified: false,
            class_ids: []
          });

        if (candidateError) {
          console.error('Error creating candidate:', candidateError);
        }
      }

      // Send Discord notification if webhook is configured
      if (discordWebhookUrl) {
        try {
          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              embeds: [{
                title: "🎉 Participation Acceptée",
                description: `La participation de **${participation.participant_name}** au concours **${competition.title}** a été acceptée.`,
                color: 3066993,
                fields: [
                  { name: "Score", value: `${totalScore}/${participation.max_possible_score}`, inline: true },
                  { name: "Pourcentage", value: `${Math.round((totalScore / participation.max_possible_score) * 100)}%`, inline: true }
                ],
                timestamp: new Date().toISOString()
              }]
            })
          });
        } catch (notificationError) {
          console.error('Discord notification failed:', notificationError);
        }
      }

      toast({
        title: "Participation acceptée",
        description: `La participation de ${participation.participant_name} a été acceptée avec succès.`,
      });

      refetch();
    } catch (error) {
      console.error('Error accepting participation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la participation.",
        variant: "destructive",
      });
    }
  };

  const handleRejectParticipation = async (participationId: string) => {
    try {
      const { error } = await supabase
        .from("dhs_competition_participations")
        .update({ status: "rejected" })
        .eq("id", participationId);

      if (error) throw error;

      toast({
        title: "Participation rejetée",
        description: "La participation a été rejetée avec succès.",
      });

      refetch();
    } catch (error) {
      console.error("Error rejecting participation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la participation.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isCompetitionLoading || isQuestionsLoading || isParticipationsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-letc-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (competitionError || questionsError || participationsError) {
    const error = competitionError || questionsError || participationsError;
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
            <p className="text-gray-500">Impossible de charger les données de la compétition.</p>
          </div>
          <Link to="/direction/competitions">
            <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Détails de l'erreur :</span>
            </div>
            <p className="text-red-700 mb-4">
              {error?.message || "Une erreur inconnue s'est produite"}
            </p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700"
              >
                Réessayer
              </Button>
              <Link to="/direction/competitions">
                <Button variant="outline">
                  Retour aux compétitions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no data found
  if (!competition) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compétition introuvable</h1>
            <p className="text-gray-500">La compétition demandée n'existe pas.</p>
          </div>
          <Link to="/direction/competitions">
            <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">
              La compétition avec l'ID "{competitionId}" n'a pas été trouvée.
            </p>
            <Link to="/direction/competitions">
              <Button>
                Retour aux compétitions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{competition.title}</h1>
          <p className="text-gray-500">
            Gérer et corriger les participations au concours.
          </p>
        </div>
        <Link to="/direction/competitions">
          <Button variant="outline" size="icon" className="bg-letc-blue text-white hover:bg-letc-darkblue">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <Separator className="mb-4" />

      {!participations || participations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune participation
              </h3>
              <p className="text-gray-500">
                Il n'y a pas encore de participations à corriger pour cette compétition.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {participations.map((participation) => (
            <Card key={participation.id} className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {participation.participant_name}
                </CardTitle>
                <CardDescription>
                  {participation.participant_rio || "Pas de RIO fourni"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Soumis le{" "}
                  {new Date(participation.submitted_at).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <Badge
                    variant={
                      participation.status === "pending"
                        ? "secondary"
                        : participation.status === "accepted"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {participation.status === "pending"
                      ? "En attente"
                      : participation.status === "accepted"
                      ? "Accepté"
                      : "Rejeté"}
                  </Badge>
                </div>

                {participation.status === "pending" && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleRejectParticipation(participation.id)}
                      className="bg-red-500 text-white hover:bg-red-700"
                    >
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => handleAcceptParticipation(participation.id)}
                      className="bg-green-500 text-white hover:bg-green-700"
                    >
                      Accepter
                    </Button>
                  </div>
                )}

                <Dialog onOpenChange={(open) => open && setCurrentQuestionIndex(0)}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-2">Voir les détails</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>
                        Détails de {participation.participant_name}
                      </DialogTitle>
                      <DialogDescription>
                        Consultation des réponses et scores par question.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {questions && questions.length > 0 && (
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Précédent
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Question {currentQuestionIndex + 1} sur {questions.length}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="flex items-center gap-2"
                          >
                            Suivant
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <ScrollArea className="h-[400px]">
                          {(() => {
                            const question = questions[currentQuestionIndex];
                            const parsedAnswers = parseAnswers(participation.answers);
                            const answer = parsedAnswers.find(
                              (a) => a.questionId === question.id
                            );

                            const answerValue = answer ? (answer.value || answer.answer || "") : "";
                            const answerScore = answer && typeof answer.score === 'number' ? answer.score : 0;
                            const answerComment = answer ? (answer.comment || "") : "";

                            return (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">{question.question}</CardTitle>
                                  <CardDescription>
                                    {question.type} - {question.max_points} points maximum
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label htmlFor={`answer-${question.id}`}>
                                      Réponse du participant:
                                    </Label>
                                    <Textarea
                                      id={`answer-${question.id}`}
                                      value={answerValue}
                                      readOnly
                                      className="bg-gray-100 text-gray-700 min-h-[100px]"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor={`score-${question.id}`}>
                                        Score attribué:
                                      </Label>
                                      <Input
                                        type="number"
                                        id={`score-${question.id}`}
                                        value={answerScore}
                                        className="bg-gray-100 text-gray-700"
                                        readOnly
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <Badge variant="outline">
                                        {answerScore} / {question.max_points}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`comment-${question.id}`}>
                                      Commentaire de correction:
                                    </Label>
                                    <Textarea
                                      id={`comment-${question.id}`}
                                      value={answerComment}
                                      className="bg-gray-100 text-gray-700"
                                      readOnly
                                      placeholder="Aucun commentaire"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })()}
                        </ScrollArea>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button>Fermer</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorrectCompetition;

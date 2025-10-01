
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  getApplicationById, 
  updateApplicationReview, 
  acceptApplication,
  getApplicationFormById
} from "@/lib/application-service";
import { ApplicationStatus } from "@/types/police";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/App";

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [overallComment, setOverallComment] = useState("");

  const { data: application, isLoading, isError } = useQuery({
    queryKey: ['application', id],
    queryFn: () => id ? getApplicationById(id) : null,
    enabled: !!id,
  });

  const { data: form } = useQuery({
    queryKey: ['application-form', application?.formId],
    queryFn: () => application?.formId ? getApplicationFormById(application.formId) : null,
    enabled: !!application?.formId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ 
      id, 
      status, 
      reviewerComment, 
      totalScore, 
      maxPossibleScore, 
      reviewedBy 
    }: {
      id: string;
      status: ApplicationStatus;
      reviewerComment?: string;
      totalScore?: number;
      maxPossibleScore?: number;
      reviewedBy: string;
    }) => updateApplicationReview(id, {
      status,
      reviewerComment,
      totalScore,
      maxPossibleScore,
      reviewedBy
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast({
        title: "Application mise à jour",
        description: "L'application a été mise à jour avec succès."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive"
      });
    }
  });

  const acceptMutation = useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy: string }) => 
      acceptApplication(id, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      toast({
        title: "Application acceptée",
        description: "L'application a été acceptée et le candidat a été créé."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'acceptation.",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Chargement de l'application...</div>;
  }

  if (isError || !application) {
    return <div className="text-center py-4 text-red-500">Application non trouvée.</div>;
  }

  const handleScoreChange = (fieldId: string, value: number) => {
    setScores(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCommentChange = (fieldId: string, value: string) => {
    setComments(prev => ({ ...prev, [fieldId]: value }));
  };

  const calculateTotalScore = () => {
    let total = 0;
    let maxPossible = 0;

    if (form) {
      application.responses.forEach(response => {
        const field = form.fields.find(f => f.id === response.fieldId);
        if (field && field.maxPoints) {
          maxPossible += field.maxPoints;
          total += scores[response.fieldId] || 0;
        }
      });
    }

    return { total, maxPossible };
  };

  const handleReview = (status: ApplicationStatus) => {
    if (!id || !user) return;

    const { total, maxPossible } = calculateTotalScore();

    updateMutation.mutate({
      id,
      status,
      reviewerComment: overallComment,
      totalScore: total,
      maxPossibleScore: maxPossible,
      reviewedBy: user.email
    });
  };

  const handleAccept = () => {
    if (!id || !user) return;
    
    acceptMutation.mutate({
      id,
      reviewedBy: user.email
    });
  };

  const handleReject = () => {
    if (!id || !user) return;
    
    updateMutation.mutate({
      id,
      status: 'rejected',
      reviewerComment: overallComment,
      reviewedBy: user.email
    });
  };

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>{application.formName}</CardTitle>
          <CardDescription>Détails de la candidature</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold">Informations du candidat</h3>
            <p>Nom: {application.applicantName}</p>
            <p>ID Discord: {application.serverId}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Réponses au formulaire</h3>
            {application.responses.map(response => {
              const field = form?.fields.find(f => f.id === response.fieldId);
              if (!field) return null;

              return (
                <div key={response.fieldId} className="mb-4">
                  <Label>{field.label}</Label>
                  <p>{response.value}</p>
                  {field.maxPoints && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`score-${response.fieldId}`}>Score (sur {field.maxPoints})</Label>
                      <Input
                        type="number"
                        id={`score-${response.fieldId}`}
                        defaultValue={0}
                        max={field.maxPoints}
                        onChange={(e) => handleScoreChange(response.fieldId, parseInt(e.target.value))}
                      />
                    </div>
                  )}
                  <Textarea
                    placeholder="Commentaire"
                    onChange={(e) => handleCommentChange(response.fieldId, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <Label>Commentaire général</Label>
            <Textarea
              placeholder="Commentaire général sur la candidature"
              onChange={(e) => setOverallComment(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="destructive" onClick={handleReject}>
              Rejeter
            </Button>
            <Button onClick={handleAccept}>
              Accepter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetail;


import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitionById, getCompetitionQuestions } from "@/lib/competition-service";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, X, Edit, Save } from "lucide-react";

const CompetitionQuestions = () => {
  const navigate = useNavigate();
  const { id: competitionId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('CompetitionQuestions - Competition ID from params:', competitionId);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "text" as "qcm" | "text" | "section",
    options: [""],
    correctAnswer: "",
    maxPoints: 1
  });

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<any>(null);

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

  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const { data, error } = await supabase
        .from('dhs_competition_questions')
        .insert({
          competition_id: competitionId,
          question: questionData.question,
          type: questionData.type,
          options: questionData.type === 'qcm' ? JSON.stringify(questionData.options.filter(opt => opt.trim())) : null,
          correct_answer: questionData.correctAnswer,
          max_points: questionData.type === 'section' ? 0 : questionData.maxPoints,
          order_number: questions.length + 1
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Question ajoutée",
        description: "La question a été ajoutée avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['competition-questions', competitionId] });
      setNewQuestion({
        question: "",
        type: "text",
        options: [""],
        correctAnswer: "",
        maxPoints: 1
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout de la question.",
        variant: "destructive"
      });
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, questionData }: { questionId: string, questionData: any }) => {
      const { data, error } = await supabase
        .from('dhs_competition_questions')
        .update({
          question: questionData.question,
          type: questionData.type,
          options: questionData.type === 'qcm' ? JSON.stringify(questionData.options.filter(opt => opt.trim())) : null,
          correct_answer: questionData.correctAnswer,
          max_points: questionData.type === 'section' ? 0 : questionData.maxPoints,
        })
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Question modifiée",
        description: "La question a été modifiée avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['competition-questions', competitionId] });
      setEditingQuestion(null);
      setEditedQuestion(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification.",
        variant: "destructive"
      });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('dhs_competition_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Question supprimée",
        description: "La question a été supprimée avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['competition-questions', competitionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression.",
        variant: "destructive"
      });
    }
  });

  const startEditing = (question: any) => {
    setEditingQuestion(question.id);
    setEditedQuestion({
      question: question.question,
      type: question.type,
      options: Array.isArray(question.options) ? question.options : [""],
      correctAnswer: question.correctAnswer || "",
      maxPoints: question.maxPoints || 1
    });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditedQuestion(null);
  };

  const saveEdit = () => {
    if (editingQuestion && editedQuestion) {
      updateQuestionMutation.mutate({
        questionId: editingQuestion,
        questionData: editedQuestion
      });
    }
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 1) {
      const newOptions = newQuestion.options.filter((_, i) => i !== index);
      setNewQuestion({ ...newQuestion, options: newOptions });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addEditOption = () => {
    if (editedQuestion) {
      setEditedQuestion({
        ...editedQuestion,
        options: [...editedQuestion.options, ""]
      });
    }
  };

  const removeEditOption = (index: number) => {
    if (editedQuestion && editedQuestion.options.length > 1) {
      const newOptions = editedQuestion.options.filter((_, i) => i !== index);
      setEditedQuestion({ ...editedQuestion, options: newOptions });
    }
  };

  const updateEditOption = (index: number, value: string) => {
    if (editedQuestion) {
      const newOptions = [...editedQuestion.options];
      newOptions[index] = value;
      setEditedQuestion({ ...editedQuestion, options: newOptions });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.question.trim()) {
      toast({
        title: "Erreur",
        description: "La question est obligatoire.",
        variant: "destructive"
      });
      return;
    }

    if (newQuestion.type === 'qcm') {
      const validOptions = newQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: "Erreur",
          description: "Au moins 2 options sont requises pour un QCM.",
          variant: "destructive"
        });
        return;
      }
    }

    createQuestionMutation.mutate(newQuestion);
  };

  if (!competition) {
    return (
      <div className="text-center py-8">
        <p>Concours introuvable...</p>
        <p className="text-sm text-gray-500 mt-2">ID recherché: {competitionId}</p>
        <Button onClick={() => navigate('/direction/competitions')} className="mt-4">
          Retour aux concours
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-letc-blue">Questions - {competition.title}</h1>
      </div>

      {/* Existing Questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Questions existantes ({questions.length})</h2>
        {questions.map((question, index) => (
          <Card key={question.id} className={question.type === 'section' ? 'bg-blue-50 border-blue-200' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {question.type === 'section' ? (
                  <span className="text-blue-800">Section: {question.question}</span>
                ) : (
                  <span>Question {index + 1} ({question.maxPoints} pts)</span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {editingQuestion !== question.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteQuestionMutation.mutate(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingQuestion === question.id ? (
                <div className="space-y-4">
                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={editedQuestion?.question || ""}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={editedQuestion?.type} 
                        onValueChange={(value) => setEditedQuestion({ ...editedQuestion, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="section">Section</SelectItem>
                          <SelectItem value="text">Texte libre</SelectItem>
                          <SelectItem value="qcm">QCM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editedQuestion?.type !== 'section' && (
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={editedQuestion?.maxPoints || 1}
                          onChange={(e) => setEditedQuestion({ ...editedQuestion, maxPoints: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  {editedQuestion?.type === 'qcm' && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Options</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addEditOption}>
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(editedQuestion.options) && editedQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateEditOption(idx, e.target.value)}
                              placeholder={`Option ${idx + 1}`}
                            />
                            {editedQuestion.options.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeEditOption(idx)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={saveEdit} disabled={updateQuestionMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-2">{question.question}</p>
                  <p className="text-sm text-gray-500">Type: {question.type}</p>
                  {question.type === 'qcm' && question.options && Array.isArray(question.options) && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Options:</p>
                      <ul className="list-disc list-inside">
                        {question.options.map((option, idx) => (
                          <li key={idx} className="text-sm">{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">
                {newQuestion.type === 'section' ? 'Titre de la section' : 'Question'}
              </Label>
              <Textarea
                id="question"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder={newQuestion.type === 'section' ? "Entrez le titre de la section..." : "Entrez votre question..."}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={newQuestion.type} 
                  onValueChange={(value: "qcm" | "text" | "section") => setNewQuestion({ ...newQuestion, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Section (titre/séparateur)</SelectItem>
                    <SelectItem value="text">Texte libre</SelectItem>
                    <SelectItem value="qcm">QCM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newQuestion.type !== 'section' && (
                <div>
                  <Label htmlFor="maxPoints">Points (barème)</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    min="1"
                    value={newQuestion.maxPoints}
                    onChange={(e) => setNewQuestion({ ...newQuestion, maxPoints: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}
            </div>

            {newQuestion.type === 'qcm' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter option
                  </Button>
                </div>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newQuestion.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-2">
                  <Label htmlFor="correctAnswer">Réponse correcte (optionnel)</Label>
                  <Input
                    id="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    placeholder="Entrez la réponse correcte..."
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={createQuestionMutation.isPending}
              className="w-full"
            >
              {createQuestionMutation.isPending ? 'Ajout...' : 'Ajouter la question'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionQuestions;

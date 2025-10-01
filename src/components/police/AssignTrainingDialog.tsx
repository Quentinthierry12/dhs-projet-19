
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSpecializedTrainings, assignTrainingToAgent } from "@/lib/police-service";
import { logTrainingActivity } from "@/lib/activity-logger";

interface AssignTrainingDialogProps {
  agentId: string;
}

const AssignTrainingDialog = ({ agentId }: AssignTrainingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [validatedBy, setValidatedBy] = useState("");
  const [score, setScore] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainings = [] } = useQuery({
    queryKey: ['specialized-trainings'],
    queryFn: getSpecializedTrainings,
  });

  const assignMutation = useMutation({
    mutationFn: assignTrainingToAgent,
    onSuccess: async (data) => {
      // Log de l'activité
      const training = Array.isArray(trainings) ? trainings.find(t => t.id === selectedTraining) : null;
      const agent = queryClient.getQueryData(['police-agent', agentId]) as any;
      
      await logTrainingActivity(
        'assign',
        selectedTraining,
        training?.title || 'Formation inconnue',
        agentId,
        agent?.name || 'Agent inconnu',
        {
          newValues: {
            completionDate,
            validatedBy,
            score: score ? parseInt(score) : undefined
          }
        }
      );

      toast({
        title: "Formation assignée",
        description: "La formation a été assignée avec succès à l'agent.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-trainings', agentId] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner la formation à l'agent.",
        variant: "destructive",
      });
      console.error('Error assigning training:', error);
    },
  });

  const resetForm = () => {
    setSelectedTraining("");
    setCompletionDate("");
    setValidatedBy("");
    setScore("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraining || !completionDate || !validatedBy) return;

    assignMutation.mutate({
      agentId,
      trainingId: selectedTraining,
      completionDate,
      validatedBy,
      score: score ? parseInt(score) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assigner Formation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner une Formation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="training">Formation</Label>
            <Select value={selectedTraining} onValueChange={setSelectedTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une formation" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(trainings) && trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="completionDate">Date de completion</Label>
            <Input
              id="completionDate"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="validatedBy">Validé par</Label>
            <Input
              id="validatedBy"
              value={validatedBy}
              onChange={(e) => setValidatedBy(e.target.value)}
              placeholder="Nom du validateur"
              required
            />
          </div>

          <div>
            <Label htmlFor="score">Score (optionnel)</Label>
            <Input
              id="score"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Score obtenu"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedTraining || !completionDate || !validatedBy || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assignment..." : "Assigner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTrainingDialog;

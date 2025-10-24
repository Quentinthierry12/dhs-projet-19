import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDisciplinaryRecord } from "@/lib/police-service";
import type { DisciplinaryType } from "@/types/police";

interface AddDisciplineDialogProps {
  agentId: string;
}

const AddDisciplineDialog = ({ agentId }: AddDisciplineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<DisciplinaryType>("warning");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: createDisciplinaryRecord,
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Sanction ajoutée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-disciplines', agentId] });
      setOpen(false);
      // Reset form
      setType("warning");
      setDate(new Date().toISOString().split('T')[0]);
      setReason("");
      setIssuedBy("");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la sanction",
        variant: "destructive",
      });
      console.error('Error adding discipline:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !date || !reason || !issuedBy) return;

    // Validate date not in future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      toast({
        title: "Erreur",
        description: "La date ne peut pas être dans le futur",
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate({
      agentId,
      type,
      date,
      reason,
      issuedBy,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une sanction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une sanction disciplinaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as DisciplinaryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="reprimand">Réprimande</SelectItem>
                <SelectItem value="suspension">Suspension</SelectItem>
                <SelectItem value="termination">Licenciement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Raison</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez la raison de la sanction..."
              maxLength={500}
              rows={4}
              required
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {reason.length}/500 caractères
            </div>
          </div>

          <div>
            <Label htmlFor="issuedBy">Émis par</Label>
            <Input
              id="issuedBy"
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              placeholder="Nom de la personne qui émet la sanction"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!type || !date || !reason || !issuedBy || addMutation.isPending}
            >
              {addMutation.isPending ? "Ajout..." : "Assigner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDisciplineDialog;


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
import { getSpecialtiesByAgency, assignSpecialtyToAgent } from "@/lib/police-service";
import { logSpecialtyActivity } from "@/lib/activity-logger";

interface AssignSpecialtyDialogProps {
  agentId: string;
  agencyId: string;
}

const AssignSpecialtyDialog = ({ agentId, agencyId }: AssignSpecialtyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: specialties = [] } = useQuery({
    queryKey: ['specialties', agencyId],
    queryFn: () => getSpecialtiesByAgency(agencyId),
  });

  const assignMutation = useMutation({
    mutationFn: assignSpecialtyToAgent,
    onSuccess: async (data) => {
      // Log de l'activité
      const specialty = specialties.find(s => s.id === selectedSpecialty);
      const agent = queryClient.getQueryData(['police-agent', agentId]) as any;
      
      await logSpecialtyActivity(
        'assign',
        selectedSpecialty,
        specialty?.name || 'Spécialité inconnue',
        agentId,
        agent?.name || 'Agent inconnu',
        {
          newValues: {
            assignedBy,
            assignedDate: new Date().toISOString()
          }
        }
      );

      toast({
        title: "Spécialité assignée",
        description: "La spécialité a été assignée avec succès à l'agent.",
      });
      queryClient.invalidateQueries({ queryKey: ['agent-specialties', agentId] });
      setOpen(false);
      setSelectedSpecialty("");
      setAssignedBy("");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner la spécialité à l'agent.",
        variant: "destructive",
      });
      console.error('Error assigning specialty:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialty || !assignedBy) return;

    assignMutation.mutate({
      agentId,
      specialtyId: selectedSpecialty,
      assignedBy,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assigner Spécialité
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner une Spécialité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="specialty">Spécialité</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une spécialité" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assignedBy">Assigné par</Label>
            <Input
              id="assignedBy"
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              placeholder="Nom de la personne qui assigne"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedSpecialty || !assignedBy || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assignment..." : "Assigner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignSpecialtyDialog;

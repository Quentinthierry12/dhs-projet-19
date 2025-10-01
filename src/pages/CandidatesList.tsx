
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchInput } from "@/components/shared/SearchInput";
import { CandidateProgress } from "@/components/shared/CandidateProgress";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllCandidates, removeCandidate, calculateCandidateProgress } from "@/lib/data-service";
import { Candidate } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CandidatesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch candidates with React Query
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: getAllCandidates
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: removeCandidate,
    onSuccess: () => {
      toast({
        title: "Candidat supprimé",
        description: "Le candidat a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setCandidateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression",
        variant: "destructive",
      });
      console.error("Error deleting candidate:", error);
    }
  });

  const handleDelete = async () => {
    if (candidateToDelete) {
      deleteMutation.mutate(candidateToDelete);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (candidate.name && candidate.name.toLowerCase().includes(searchLower)) ||
      (candidate.serverId && candidate.serverId.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Candidats</h1>
        <Link to="/candidates/add">
          <Button className="bg-letc-blue hover:bg-letc-darkblue">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un candidat
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un candidat..."
          className="w-64"
        />
        <div className="text-sm text-gray-500">
          {filteredCandidates.length} candidat{filteredCandidates.length !== 1 && 's'}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom RP</TableHead>
              <TableHead>ID Serveur</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Chargement des candidats...
                </TableCell>
              </TableRow>
            ) : filteredCandidates.length > 0 ? (
              filteredCandidates.map(candidate => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    <Link 
                      to={`/candidates/${candidate.id}`} 
                      className="text-letc-blue hover:text-letc-lightblue hover:underline"
                    >
                      {candidate.name || 'Nom non défini'}
                    </Link>
                  </TableCell>
                  <TableCell>#{candidate.serverId || 'ID non défini'}</TableCell>
                  <TableCell>
                    {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="w-40">
                      <CandidateProgress candidate={candidate} size="sm" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {candidate.isCertified ? (
                      <Badge className="bg-letc-green">Certifié</Badge>
                    ) : (
                      <Badge variant="outline">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCandidateToDelete(candidate.id)}
                      className="text-letc-red hover:bg-red-50 hover:text-letc-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {searchQuery ? "Aucun candidat trouvé" : "Aucun candidat ajouté"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        title="Supprimer le candidat"
        description="Êtes-vous sûr de vouloir supprimer ce candidat ? Cette action ne peut pas être annulée."
        open={!!candidateToDelete}
        onOpenChange={() => setCandidateToDelete(null)}
        onConfirm={handleDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};

export default CandidatesList;

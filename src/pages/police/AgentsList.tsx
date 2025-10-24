import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPoliceAgents,
  deletePoliceAgent,
  getPoliceAgencies,
  getPoliceGrades,
  createAgent as addAgent
} from "@/lib/police-service";
import { PoliceAgent, Agency, Grade } from "@/types/police";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Plus, Eye, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportAgentsPDF } from "@/lib/pdf-service";

const AgentsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    badgeNumber: "",
    agencyId: "",
    gradeId: "",
    status: "active",
    candidateId: "",
  });

  const { 
    data: initialAgents, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['agents'],
    queryFn: getAllPoliceAgents,
  });

  const { data: agenciesData, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ['agencies'],
    queryFn: getPoliceAgencies,
  });

  const { data: gradesData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ['grades'],
    queryFn: () => getPoliceGrades(),
  });

  useEffect(() => {
    if (agenciesData) {
      setAgencies(agenciesData);
    }
  }, [agenciesData]);

  useEffect(() => {
    if (gradesData) {
      setGrades(gradesData);
    }
  }, [gradesData]);

  useEffect(() => {
    if (initialAgents) {
      setAgents(initialAgents);
      setFilteredAgents(initialAgents);
    }
  }, [initialAgents]);

  useEffect(() => {
    const filtered = agents.filter(agent => {
      const searchMatch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (agent.email && agent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (agent.phoneNumber && agent.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const agencyMatch = agencyFilter ? agent.agencyId === agencyFilter : true;
      const gradeMatch = gradeFilter ? agent.gradeId === gradeFilter : true;

      return searchMatch && agencyMatch && gradeMatch;
    });
    setFilteredAgents(filtered);
  }, [searchTerm, agencyFilter, gradeFilter, agents]);

  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => deletePoliceAgent(id),
    onSuccess: () => {
      toast({
        title: "Agent supprimé",
        description: "L'agent a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'agent",
        variant: "destructive",
      });
    }
  });

  const addAgentMutation = useMutation({
    mutationFn: (data: {
      name: string;
      badgeNumber: string;
      agencyId: string;
      gradeId: string;
      status: string;
      candidateId?: string;
    }) => addAgent(data),
    onSuccess: () => {
      toast({
        title: "Agent ajouté",
        description: "L'agent a été ajouté avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setOpen(false);
      setFormData({ name: "", badgeNumber: "", agencyId: "", gradeId: "", status: "active", candidateId: "" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'agent",
        variant: "destructive",
      });
    }
  });

  const handleDeleteAgent = (id: string) => {
    deleteAgentMutation.mutate(id);
  };

  const handleAddAgent = () => {
    addAgentMutation.mutate({
      name: formData.name,
      badgeNumber: formData.badgeNumber,
      agencyId: formData.agencyId,
      gradeId: formData.gradeId,
      status: formData.status,
      candidateId: formData.candidateId || undefined,
    });
  };

  if (isLoading || isLoadingAgencies || isLoadingGrades) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/police/agencies")}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil Police
          </Button>
          <h1 className="text-3xl font-bold text-letc-blue">Agents</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/police/agents/add")}
            className="bg-letc-blue hover:bg-letc-darkblue"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un agent existant
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-letc-blue hover:bg-letc-darkblue">
                <Plus className="h-4 w-4 mr-2" />
                Créer un agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un agent</DialogTitle>
                <DialogDescription>
                  Créer un nouvel agent pour une agence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agentName">Nom de l'agent</Label>
                  <Input
                    id="agentName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="badgeNumber">Numéro de matricule</Label>
                  <Input
                    id="badgeNumber"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="Ex: 123456"
                  />
                </div>
                <div>
                  <Label htmlFor="agency">Agence</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, agencyId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une agence" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gradeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="retired">Retraité</SelectItem>
                      <SelectItem value="training">En formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddAgent} 
                  disabled={addAgentMutation.isPending}
                  className="w-full"
                >
                  {addAgentMutation.isPending ? "Ajout..." : "Ajouter l'agent"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
            <Input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={(value) => setAgencyFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par agence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les agences</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setGradeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.badgeNumber}</TableCell>
                  <TableCell>{agent.phoneNumber || '-'}</TableCell>
                  <TableCell>{agent.email || '-'}</TableCell>
                  <TableCell>{agent.agencyName}</TableCell>
                  <TableCell>{agent.gradeName}</TableCell>
                  <TableCell>{agent.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/police/agents/${agent.id}`)}>
                      <Eye className="h-4 w-4 mr-1" /> Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <ExportButton
          onClick={() => exportAgentsPDF(filteredAgents as any, 'Liste des Agents')}
          loading={false}
          className="ml-2"
        >
          Export PDF
        </ExportButton>
      </div>
    </div>
  );
};

export default AgentsList;

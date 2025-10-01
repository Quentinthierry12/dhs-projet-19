import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitionById, getCompetitionInvitations, createInvitations } from "@/lib/competition-service";
import { exportCompetitionInvitationsPDF, exportSingleInvitationPDF, generateConvocationPDF } from "@/lib/pdf-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Copy, Mail, Users, Key, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";

const CompetitionInvitations = () => {
  const navigate = useNavigate();
  const { id: competitionId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [candidatesList, setCandidatesList] = useState("");
  const [isAddingCandidates, setIsAddingCandidates] = useState(false);

  console.log('CompetitionInvitations - competitionId:', competitionId);

  const { data: competition, isLoading: competitionLoading, error: competitionError } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: () => getCompetitionById(competitionId!),
    enabled: !!competitionId,
  });

  const { data: invitations = [], isLoading: invitationsLoading, error: invitationsError } = useQuery({
    queryKey: ['competition-invitations', competitionId],
    queryFn: () => getCompetitionInvitations(competitionId!),
    enabled: !!competitionId,
  });

  console.log('Competition data:', competition);
  console.log('Competition loading:', competitionLoading);
  console.log('Competition error:', competitionError);
  console.log('Invitations data:', invitations);
  console.log('Invitations loading:', invitationsLoading);
  console.log('Invitations error:', invitationsError);

  const createInvitationsMutation = useMutation({
    mutationFn: (candidates: Array<{name: string, email?: string}>) => 
      createInvitations(competitionId!, candidates),
    onSuccess: () => {
      toast({
        title: "Invitations créées",
        description: "Les invitations ont été créées avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['competition-invitations', competitionId] });
      setCandidatesList("");
      setIsAddingCandidates(false);
    },
    onError: (error: any) => {
      console.error('Error creating invitations:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création des invitations.",
        variant: "destructive"
      });
    }
  });

  const handleAddCandidates = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidatesList.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un nom.",
        variant: "destructive"
      });
      return;
    }

    const candidates = candidatesList
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Format: "Nom" ou "Nom (email@example.com)"
        const emailMatch = line.match(/^(.+?)\s*\((.+@.+\..+)\)$/);
        if (emailMatch) {
          return { name: emailMatch[1].trim(), email: emailMatch[2].trim() };
        }
        return { name: line };
      });

    createInvitationsMutation.mutate(candidates);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "L'information a été copiée dans le presse-papiers."
    });
  };

  const generateInvitationText = (invitation: any) => {
    return `Bonjour ${invitation.candidateName},

Vous êtes invité(e) à participer au concours privé : ${competition?.title}

Identifiants de connexion :
- Identifiant : ${invitation.loginIdentifier}
- Mot de passe : ${invitation.loginPassword}

Lien d'accès : ${window.location.origin}/competition/${competitionId}/login

Cordialement,
L'équipe LETC`;
  };

  const handleExportPDF = () => {
    if (competition && invitations.length > 0) {
      exportCompetitionInvitationsPDF(invitations, competition.title);
      toast({
        title: "Export réussi",
        description: "Le PDF des invitations a été généré avec succès."
      });
    } else {
      toast({
        title: "Aucune donnée",
        description: "Aucune invitation à exporter.",
        variant: "destructive"
      });
    }
  };

  const handleExportSinglePDF = (invitation: any) => {
    if (competition) {
      exportSingleInvitationPDF(invitation, competition.title);
      toast({
        title: "Export réussi",
        description: `Le PDF de l'invitation pour ${invitation.candidateName} a été généré avec succès.`
      });
    }
  };

  const handleGenerateConvocation = (invitation: any) => {
    if (competition) {
      generateConvocationPDF(invitation, competition.title);
      toast({
        title: "Convocation générée",
        description: `La convocation officielle pour ${invitation.candidateName} a été générée avec succès.`
      });
    }
  };

  // Afficher les erreurs si elles existent
  if (competitionError) {
    console.error('Competition error:', competitionError);
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement du concours: {competitionError.message}</p>
        <Button onClick={() => navigate('/direction/competitions')} className="mt-4">
          Retour aux concours
        </Button>
      </div>
    );
  }

  if (invitationsError) {
    console.error('Invitations error:', invitationsError);
  }

  // Afficher le chargement seulement si les données ne sont pas encore disponibles
  if (competitionLoading) {
    return <div className="text-center py-8">Chargement du concours...</div>;
  }

  // Vérifier si le concours existe
  if (!competition) {
    return (
      <div className="text-center py-8">
        <p>Concours non trouvé.</p>
        <Button onClick={() => navigate('/direction/competitions')} className="mt-4">
          Retour aux concours
        </Button>
      </div>
    );
  }

  // Vérifier si c'est un concours privé
  if (competition.type !== 'privé') {
    return (
      <div className="text-center py-8">
        <p>Ce concours n'est pas de type privé.</p>
        <Button onClick={() => navigate('/direction/competitions')} className="mt-4">
          Retour aux concours
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/direction/competitions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux concours
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-letc-blue">Invitations - {competition.title}</h1>
          <p className="text-gray-600">Gestion des invitations pour le concours privé</p>
        </div>
        <ExportButton
          onClick={handleExportPDF}
          disabled={invitations.length === 0}
          className="ml-auto"
        >
          Exporter PDF
        </ExportButton>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total invitations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisées</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invitations.filter(inv => inv.status === 'used').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {invitations.filter(inv => inv.status === 'created').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ajouter des candidats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter des candidats
          </CardTitle>
          <CardDescription>
            Créez de nouvelles invitations pour des candidats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAddingCandidates ? (
            <Button onClick={() => setIsAddingCandidates(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des candidats
            </Button>
          ) : (
            <form onSubmit={handleAddCandidates} className="space-y-4">
              <div>
                <Label htmlFor="candidates">Liste des candidats</Label>
                <Textarea
                  id="candidates"
                  value={candidatesList}
                  onChange={(e) => setCandidatesList(e.target.value)}
                  placeholder="Un nom par ligne. Format possible :&#10;Jean Dupont&#10;Marie Martin (marie@email.com)&#10;Pierre Durand"
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Un nom par ligne. Vous pouvez optionnellement ajouter l'email entre parenthèses.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createInvitationsMutation.isPending}
                >
                  {createInvitationsMutation.isPending ? 'Création...' : 'Créer les invitations'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsAddingCandidates(false);
                    setCandidatesList("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Liste des invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations créées ({invitations.length})</CardTitle>
          <CardDescription>
            Liste de toutes les invitations avec leurs identifiants de connexion
            {invitationsError && (
              <span className="text-red-600 block mt-1">
                Erreur lors du chargement des invitations: {invitationsError.message}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <div className="text-center py-4">Chargement des invitations...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune invitation créée pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">{invitation.candidateName}</h3>
                      {invitation.candidateEmail && (
                        <p className="text-sm text-gray-600">{invitation.candidateEmail}</p>
                      )}
                    </div>
                    <Badge variant={invitation.status === 'used' ? 'default' : 'secondary'}>
                      {invitation.status === 'used' ? 'Utilisée' : 'En attente'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500">Identifiant</Label>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {invitation.loginIdentifier}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.loginIdentifier)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Mot de passe</Label>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {invitation.loginPassword}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.loginPassword)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateInvitationText(invitation))}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Copier message d'invitation
                    </Button>
                    <ExportButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportSinglePDF(invitation)}
                    >
                      PDF simple
                    </ExportButton>
                    <ExportButton
                      size="sm"
                      variant="default"
                      onClick={() => handleGenerateConvocation(invitation)}
                      className="bg-letc-blue hover:bg-letc-darkblue"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Convocation officielle
                    </ExportButton>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Créée le {new Date(invitation.createdAt).toLocaleDateString('fr-FR')} à {new Date(invitation.createdAt).toLocaleTimeString('fr-FR')}
                    {invitation.usedAt && (
                      <span> • Utilisée le {new Date(invitation.usedAt).toLocaleDateString('fr-FR')} à {new Date(invitation.usedAt).toLocaleTimeString('fr-FR')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionInvitations;

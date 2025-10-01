import { useState } from "react";
import { Candidate, Module, SubModule, SubModuleScore, SubModuleAppreciation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Award, FileText, Edit, Save, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addSubModuleAppreciation, getSubModuleAppreciations, removeSubModuleAppreciation } from "@/lib/data-service";
import { exportBulletinPDF } from "@/lib/pdf-service";
import { ExportButton } from "@/components/shared/ExportButton";

interface BulletinTabProps {
  candidate: Candidate;
  modules: Module[];
}

const BulletinTab = ({ candidate, modules }: BulletinTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appreciationDialogOpen, setAppreciationDialogOpen] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState<string>("");
  const [appreciationText, setAppreciationText] = useState<string>("");

  // Fetch existing appreciations
  const { data: appreciations = [] } = useQuery({
    queryKey: ['sub-module-appreciations', candidate.id],
    queryFn: () => getSubModuleAppreciations(candidate.id),
  });

  // Appreciation mutation
  const appreciationMutation = useMutation({
    mutationFn: (params: {
      candidateId: string;
      subModuleId: string;
      appreciation: string;
      instructorId: string;
    }) => addSubModuleAppreciation({
      candidateId: params.candidateId,
      subModuleId: params.subModuleId,
      appreciation: params.appreciation,
      instructorId: params.instructorId
    }),
    onSuccess: () => {
      toast({
        title: "Appréciation enregistrée",
        description: "L'appréciation a été ajoutée au bulletin",
      });
      queryClient.invalidateQueries({ queryKey: ['sub-module-appreciations', candidate.id] });
      setAppreciationDialogOpen(false);
      setAppreciationText("");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement de l'appréciation",
        variant: "destructive",
      });
      console.error("Error saving appreciation:", error);
    }
  });

  // Delete appreciation mutation
  const deleteAppreciationMutation = useMutation({
    mutationFn: (appreciationId: string) => removeSubModuleAppreciation(appreciationId),
    onSuccess: () => {
      toast({
        title: "Appréciation supprimée",
        description: "L'appréciation a été supprimée du bulletin",
      });
      queryClient.invalidateQueries({ queryKey: ['sub-module-appreciations', candidate.id] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'appréciation",
        variant: "destructive",
      });
      console.error("Error deleting appreciation:", error);
    }
  });

  const getSubModuleScore = (subModuleId: string): SubModuleScore | null => {
    if (!candidate.moduleScores) return null;
    return candidate.moduleScores.find(score => score.subModuleId === subModuleId) || null;
  };

  const getSubModuleAppreciation = (subModuleId: string): SubModuleAppreciation | null => {
    return appreciations.find(app => app.subModuleId === subModuleId) || null;
  };

  const handleAddAppreciation = (subModuleId: string) => {
    setSelectedSubModule(subModuleId);
    const existingAppreciation = getSubModuleAppreciation(subModuleId);
    setAppreciationText(existingAppreciation?.appreciation || "");
    setAppreciationDialogOpen(true);
  };

  const handleSaveAppreciation = () => {
    if (!selectedSubModule || !appreciationText.trim()) return;

    appreciationMutation.mutate({
      candidateId: candidate.id,
      subModuleId: selectedSubModule,
      appreciation: appreciationText,
      instructorId: "instructor" // You might want to get this from user context
    });
  };

  const handleExportBulletin = () => {
    try {
      exportBulletinPDF(candidate, modules, appreciations);
      toast({
        title: "Export réussi",
        description: "Le bulletin a été exporté en PDF",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export PDF",
        variant: "destructive",
      });
      console.error("Error exporting bulletin:", error);
    }
  };

  const calculateOverallScore = () => {
    if (!candidate.moduleScores || candidate.moduleScores.length === 0) return { score: 0, maxScore: 0, percentage: 0 };
    
    const totalScore = candidate.moduleScores.reduce((sum, score) => sum + score.score, 0);
    const totalMaxScore = candidate.moduleScores.reduce((sum, score) => sum + score.maxScore, 0);
    const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    
    return { score: totalScore, maxScore: totalMaxScore, percentage };
  };

  const overallScore = calculateOverallScore();

  const handleDeleteAppreciation = (appreciationId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette appréciation ?")) {
      deleteAppreciationMutation.mutate(appreciationId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulletin Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-letc-blue" />
                Bulletin de Formation FLETC
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {candidate.name} - #{candidate.serverId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportBulletin}
                variant="outline"
                size="sm"
                className="border-letc-blue text-letc-blue hover:bg-letc-blue hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter Bulletin PDF
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date d'édition</p>
                <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Score Total</p>
              <p className="text-2xl font-bold text-letc-blue">
                {overallScore.score}/{overallScore.maxScore}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Pourcentage</p>
              <p className="text-2xl font-bold text-green-600">{overallScore.percentage}%</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Statut</p>
              <Badge 
                className={candidate.isCertified ? "bg-letc-green" : overallScore.percentage >= 80 ? "bg-yellow-500" : "bg-gray-500"}
              >
                {candidate.isCertified ? "Certifié FLETC" : overallScore.percentage >= 80 ? "Éligible" : "En cours"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Details */}
      <div className="space-y-6">
        {modules.map(module => {
          const moduleScores = module.subModules?.map(sm => getSubModuleScore(sm.id)).filter(Boolean) || [];
          const moduleTotal = moduleScores.reduce((sum, score) => sum + (score?.score || 0), 0);
          const moduleMaxTotal = module.subModules?.reduce((sum, sm) => sum + sm.maxScore, 0) || 0;
          const modulePercentage = moduleMaxTotal > 0 ? Math.round((moduleTotal / moduleMaxTotal) * 100) : 0;

          return (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <div className="text-right">
                    <p className="font-semibold">{moduleTotal}/{moduleMaxTotal}</p>
                    <p className="text-sm text-gray-500">{modulePercentage}%</p>
                  </div>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {module.subModules?.map(subModule => {
                    const score = getSubModuleScore(subModule.id);
                    const appreciation = getSubModuleAppreciation(subModule.id);
                    
                    return (
                      <div key={subModule.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{subModule.name}</h4>
                              {subModule.isOptional && (
                                <Badge variant="outline" className="text-xs">Optionnel</Badge>
                              )}
                            </div>
                            {score ? (
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-semibold text-letc-blue">
                                  {score.score}/{subModule.maxScore}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({Math.round((score.score / subModule.maxScore) * 100)}%)
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline">Non évalué</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddAppreciation(subModule.id)}
                              className="text-letc-blue hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {appreciation ? 'Modifier' : 'Ajouter'} appréciation
                            </Button>
                            {appreciation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAppreciation(appreciation.id)}
                                disabled={deleteAppreciationMutation.isPending}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {appreciation && (
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-letc-blue">
                            <p className="text-sm font-medium text-gray-700 mb-1">Appréciation :</p>
                            <p className="text-sm text-gray-600">{appreciation.appreciation}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Modifié le {new Date(appreciation.updatedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        )}
                        
                        {score?.comment && (
                          <div className="mt-3 p-3 bg-white rounded border-l-4 border-gray-300">
                            <p className="text-sm font-medium text-gray-700 mb-1">Commentaire de l'évaluation :</p>
                            <p className="text-sm text-gray-600">{score.comment}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Appreciation Dialog */}
      <Dialog open={appreciationDialogOpen} onOpenChange={setAppreciationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appréciation du sous-module</DialogTitle>
            <DialogDescription>
              Ajoutez une appréciation détaillée pour ce sous-module
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Appréciation</label>
              <Textarea
                placeholder="Rédigez votre appréciation sur les compétences et la progression du candidat..."
                value={appreciationText}
                onChange={e => setAppreciationText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAppreciationDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveAppreciation}
              disabled={!appreciationText.trim() || appreciationMutation.isPending}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              <Save className="h-4 w-4 mr-2" />
              {appreciationMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulletinTab;

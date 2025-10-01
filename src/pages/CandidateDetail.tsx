import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  getCandidateById, 
  getAllModules, 
  getClassById,
  removeCandidate,
  addSubModuleScore,
  calculateCandidateProgress,
  certifyCandidate
} from "@/lib/data-service";
import { Candidate, Module, SubModule, Class } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { 
  AlertTriangle,
  Award,
  ChevronLeft, 
  Trash2, 
  Edit, 
  School,
  Check,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportCandidateModulesPDF } from "@/lib/pdf-service";
import { ExportButton } from "@/components/shared/ExportButton";
import BulletinTab from "@/components/candidate/BulletinTab";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [certifyDialogOpen, setCertifyDialogOpen] = useState(false);
  const [instructorName, setInstructorName] = useState("");
  
  // Score dialog state
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedSubModule, setSelectedSubModule] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(10);
  const [comment, setComment] = useState<string>("");

  // Fetch candidate details
  const { 
    data: candidate,
    isLoading: isLoadingCandidate,
    error: candidateError
  } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => id ? getCandidateById(id) : Promise.resolve(undefined),
    enabled: !!id,
  });

  // Fetch modules
  const { 
    data: modules = [],
    isLoading: isLoadingModules
  } = useQuery({
    queryKey: ['modules'],
    queryFn: getAllModules,
  });

  // Fetch classes for this candidate
  const { 
    data: classes = [], 
    isLoading: isLoadingClasses 
  } = useQuery({
    queryKey: ['candidate-classes', id],
    queryFn: async () => {
      if (!candidate) return [];
      const classes: Class[] = [];
      for (const classId of candidate.classIds) {
        const foundClass = await getClassById(classId);
        if (foundClass) {
          classes.push(foundClass);
        }
      }
      return classes;
    },
    enabled: !!candidate,
  });

  // Calculate progress
  const { 
    data: progress = {
      totalScore: 0,
      maxPossibleScore: 100,
      percentage: 0
    },
    isLoading: isLoadingProgress
  } = useQuery({
    queryKey: ['candidate-progress', id],
    queryFn: () => candidate ? calculateCandidateProgress(candidate) : Promise.resolve({
      totalScore: 0,
      maxPossibleScore: 100,
      percentage: 0
    }),
    enabled: !!candidate,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: removeCandidate,
    onSuccess: () => {
      toast({
        title: "Candidat supprimé",
        description: "Le candidat a été supprimé avec succès",
      });
      navigate("/candidates");
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

  // Score mutation
  const scoreMutation = useMutation({
    mutationFn: (params: {
      candidateId: string;
      subModuleId: string;
      score: number;
      maxScore: number;
      instructorId: string;
      comment?: string;
    }) => addSubModuleScore({
      candidateId: params.candidateId,
      subModuleId: params.subModuleId,
      score: params.score,
      maxScore: params.maxScore,
      instructorId: params.instructorId,
      comment: params.comment
    }),
    onSuccess: () => {
      toast({
        title: "Score enregistré",
        description: "Le score du candidat a été mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      queryClient.invalidateQueries({ queryKey: ['candidate-progress', id] });
      setScoreDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du score",
        variant: "destructive",
      });
      console.error("Error saving score:", error);
    }
  });

  // Certification mutation
  const certifyMutation = useMutation({
    mutationFn: ({ candidateId, instructorName }: { candidateId: string; instructorName: string }) => 
      certifyCandidate(candidateId, instructorName),
    onSuccess: () => {
      toast({
        title: "Certification validée",
        description: "Le candidat a été certifié FLETC avec succès",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setCertifyDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la certification",
        variant: "destructive",
      });
      console.error("Error certifying candidate:", error);
    }
  });

  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const handleCertify = () => {
    if (id && instructorName.trim()) {
      certifyMutation.mutate({
        candidateId: id,
        instructorName
      });
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId);
    setSelectedSubModule("");
    setScore(0);
    setComment("");
    
    const module = modules.find(m => m.id === moduleId);
    if (module && module.subModules.length > 0) {
      setMaxScore(module.subModules[0].maxScore);
    }
  };

  const handleSubModuleChange = (subModuleId: string) => {
    setSelectedSubModule(subModuleId);
    
    const module = modules.find(m => m.id === selectedModule);
    if (module) {
      const subModule = module.subModules.find(sm => sm.id === subModuleId);
      if (subModule) {
        setMaxScore(subModule.maxScore);
        
        // Set existing score if available
        if (candidate && candidate.moduleScores) {
          const existingScore = candidate.moduleScores.find(
            s => s.subModuleId === subModuleId
          );
          if (existingScore) {
            setScore(existingScore.score);
            setComment(existingScore.comment || "");
          } else {
            setScore(0);
            setComment("");
          }
        }
      }
    }
  };

  const handleSaveScore = async () => {
    if (!candidate || !selectedModule || !selectedSubModule) return;
    
    scoreMutation.mutate({
      candidateId: candidate.id,
      subModuleId: selectedSubModule,
      score,
      maxScore,
      instructorId: "instructor", // You might want to get this from user context
      comment
    });
  };

  // Check if candidate is eligible for certification
  const isEligibleForCertification = progress.percentage >= 80 && !candidate?.isCertified;

  // Show loading state
  if (isLoadingCandidate) {
    return (
      <div className="text-center py-12">
        <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
      </div>
    );
  }

  // Show error state
  if (candidateError || !candidate) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-letc-red" />
        <h2 className="mt-4 text-2xl font-semibold">Candidat introuvable</h2>
        <p className="mt-2 text-gray-500">Le candidat demandé n'existe pas ou a été supprimé</p>
        <Link to="/candidates">
          <Button className="mt-4">
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  const getSubModuleScore = (subModuleId: string) => {
    if (!candidate.moduleScores) return null;
    
    return candidate.moduleScores.find(
      score => score.subModuleId === subModuleId
    ) || null;
  };

  const handleExportModulesPDF = () => {
    if (candidate && modules) {
      exportCandidateModulesPDF(candidate, candidate.moduleScores || [], modules);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/candidates")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-letc-blue">{candidate.name}</h1>
          <Badge className="ml-2">#{candidate.serverId}</Badge>
          {candidate.isCertified && (
            <Badge className="bg-letc-green ml-2 flex items-center gap-1">
              <Award className="h-3 w-3" />
              Certifié FLETC
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <ExportButton
            onClick={handleExportModulesPDF}
            variant="outline"
          >
            Export PDF Modules
          </ExportButton>
          
          {isEligibleForCertification && (
            <Button
              variant="default"
              onClick={() => setCertifyDialogOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <ShieldCheck className="h-4 w-4" />
              Valider FLETC
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setScoreDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Valider un module
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-letc-red hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Retirer le candidat
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nom RP</p>
                <p>{candidate.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ID Serveur</p>
                <p>#{candidate.serverId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'ajout</p>
                <p>{new Date(candidate.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {candidate.isCertified && candidate.certificationDate && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de certification</p>
                  <p>{new Date(candidate.certificationDate).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              
              {candidate.isCertified && candidate.certifiedBy && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Certifié par</p>
                  <p>{candidate.certifiedBy}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Progression</p>
                <div className="mt-2">
                  <ProgressBar
                    value={progress.totalScore}
                    max={progress.maxPossibleScore}
                    showValues
                    showPercent
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {progress.percentage}% de progression
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Classes</p>
                <p>{classes.length} classe{classes.length !== 1 && 's'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <Tabs defaultValue="modules">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="modules">Modules & Points</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="bulletin" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bulletin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modules</CardTitle>
                  <CardDescription>
                    Progression du candidat dans les différents modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingModules ? (
                    <p className="text-center py-6">Chargement des modules...</p>
                  ) : modules.length > 0 ? (
                    <div className="space-y-8">
                      {modules.map(module => (
                        <div key={module.id} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{module.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedModule(module.id);
                                if (module.subModules.length > 0) {
                                  setSelectedSubModule(module.subModules[0].id);
                                  setMaxScore(module.subModules[0].maxScore);
                                }
                                setScoreDialogOpen(true);
                              }}
                              className="text-letc-blue hover:text-letc-lightblue hover:bg-blue-50"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Valider
                            </Button>
                          </div>
                          
                          <div className="divide-y">
                            {module.subModules.map(subModule => {
                              const scoreData = getSubModuleScore(subModule.id);
                              const isCompleted = !!scoreData;
                              
                              return (
                                <div key={subModule.id} className="py-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {subModule.name}
                                        </span>
                                        {isCompleted && (
                                          <Badge className="bg-letc-green">
                                            Validé
                                          </Badge>
                                        )}
                                      </div>
                                      {scoreData?.comment && (
                                        <p className="text-sm text-gray-500 mt-1">
                                          {scoreData.comment}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="text-right">
                                      {isCompleted ? (
                                        <div>
                                          <span className="font-bold text-lg">
                                            {scoreData.score}
                                          </span>
                                          <span className="text-gray-500">/{subModule.maxScore}</span>
                                        </div>
                                      ) : (
                                        <Badge variant="outline">Non validé</Badge>
                                      )}
                                      
                                      {isCompleted && (
                                        <p className="text-xs text-gray-500">
                                          {new Date(scoreData.timestamp).toLocaleDateString('fr-FR')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-gray-500">
                      Aucun module disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="classes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des classes</CardTitle>
                  <CardDescription>
                    Classes suivies par le candidat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingClasses ? (
                    <p className="text-center py-6">Chargement des classes...</p>
                  ) : classes.length > 0 ? (
                    <div className="divide-y">
                      {classes.map(trainingClass => (
                        <div key={trainingClass.id} className="py-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{trainingClass.name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(trainingClass.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-500">
                              Instructeur: {trainingClass.instructorName}
                            </p>
                            <Link to={`/classes/${trainingClass.id}`}>
                              <Button variant="ghost" size="sm" className="text-letc-blue">
                                <School className="h-4 w-4 mr-2" />
                                Voir la classe
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-gray-500">
                      Ce candidat n'a participé à aucune classe
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulletin" className="mt-4">
              <BulletinTab candidate={candidate} modules={modules} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        title="Supprimer le candidat"
        description="Êtes-vous sûr de vouloir supprimer ce candidat ? Cette action ne peut pas être annulée."
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
      
      {/* Score Dialog */}
      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Valider un module</DialogTitle>
            <DialogDescription>
              Attribuez un score à un module pour ce candidat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Module</label>
              <Select value={selectedModule} onValueChange={handleModuleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sous-module</label>
              <Select 
                value={selectedSubModule} 
                onValueChange={handleSubModuleChange}
                disabled={!selectedModule}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un sous-module" />
                </SelectTrigger>
                <SelectContent>
                  {selectedModule && modules.find(m => m.id === selectedModule)?.subModules.map(subModule => (
                    <SelectItem key={subModule.id} value={subModule.id}>
                      {subModule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Score (max: {maxScore})
              </label>
              <Input
                type="number"
                min="0"
                max={maxScore}
                value={score}
                onChange={e => setScore(parseInt(e.target.value) || 0)}
                disabled={!selectedSubModule}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire (optionnel)</label>
              <Textarea
                placeholder="Commentaire sur la performance du candidat"
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={!selectedSubModule}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setScoreDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSaveScore} 
              className="bg-letc-blue hover:bg-letc-darkblue"
              disabled={!selectedModule || !selectedSubModule || scoreMutation.isPending}
            >
              {scoreMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Certification Dialog */}
      <Dialog open={certifyDialogOpen} onOpenChange={setCertifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Valider la certification FLETC</DialogTitle>
            <DialogDescription>
              Le candidat a terminé sa formation et peut maintenant être certifié.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-letc-green">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Critères de certification atteints
                    </h4>
                    <ul className="mt-1 text-sm text-green-700 list-disc pl-5">
                      <li>Score total suffisant : {progress.percentage}% (min. 80%)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de l'instructeur validant</label>
                <Input
                  type="text"
                  value={instructorName}
                  onChange={e => setInstructorName(e.target.value)}
                  placeholder="Votre nom RP"
                />
                <p className="text-xs text-gray-500">
                  Cette information sera enregistrée avec la certification
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCertifyDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCertify} 
              disabled={!instructorName.trim() || certifyMutation.isPending}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <ShieldCheck className="h-4 w-4" />
              {certifyMutation.isPending ? "Validation en cours..." : "Valider la certification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CandidateDetail;

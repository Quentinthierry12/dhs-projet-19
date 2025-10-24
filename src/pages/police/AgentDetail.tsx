import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Key, Shield, Mail, User, Phone, MapPin, Calendar, Award, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllAgents, 
  getAgencies, 
  getAgencyGrades, 
  updateAgent, 
  createAgentLogin, 
  updateAgentLogin, 
  getAgentLogin,
  getAgentSpecialties,
  removeSpecialtyFromAgent,
  getAgentDisciplinaryRecords,
  type PoliceAgent,
  type PoliceAgency,
  type PoliceGrade,
  type AgentStatus,
  type DisciplinaryType
} from '@/lib/police-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssignSpecialtyDialog from '@/components/police/AssignSpecialtyDialog';
import AddDisciplineDialog from '@/components/police/AddDisciplineDialog';

interface AgentLogin {
  id: string;
  badgeNumber: string;
  password: string;
  isActive: boolean;
  lastLogin?: string;
}

const AgentDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<PoliceAgent | null>(null);
  const [agentLogin, setAgentLogin] = useState<AgentLogin | null>(null);
  const [agencies, setAgencies] = useState<PoliceAgency[]>([]);
  const [grades, setGrades] = useState<PoliceGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    badgeNumber: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
    discordId: '',
    agencyId: '',
    gradeId: '',
    status: 'active' as AgentStatus,
    candidateId: '',
  });

  const [loginData, setLoginData] = useState({
    password: '',
    isActive: true
  });

  // React Query setup
  const queryClient = useQueryClient();

  const { data: specialties = [], isLoading: specialtiesLoading } = useQuery({
    queryKey: ['agent-specialties', agentId],
    queryFn: () => getAgentSpecialties(agentId || ''),
    enabled: !!agentId
  });

  const { data: disciplines = [], isLoading: disciplinesLoading } = useQuery({
    queryKey: ['agent-disciplines', agentId],
    queryFn: () => getAgentDisciplinaryRecords(agentId || ''),
    enabled: !!agentId
  });

  const removeSpecialtyMutation = useMutation({
    mutationFn: removeSpecialtyFromAgent,
    onSuccess: () => {
      toast({ title: "Succès", description: "Spécialité retirée" });
      queryClient.invalidateQueries({ queryKey: ['agent-specialties', agentId] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de retirer la spécialité", variant: "destructive" });
    }
  });

  // Helper functions for disciplines
  const getDisciplineColor = (type: DisciplinaryType) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'reprimand': return 'bg-orange-50 border-orange-200';
      case 'suspension': return 'bg-red-50 border-red-200';
      case 'termination': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-50';
    }
  };

  const getDisciplineLabel = (type: DisciplinaryType) => {
    switch (type) {
      case 'warning': return 'AVERTISSEMENT';
      case 'reprimand': return 'RÉPRIMANDE';
      case 'suspension': return 'SUSPENSION';
      case 'termination': return 'LICENCIEMENT';
      default: return type.toUpperCase();
    }
  };

  useEffect(() => {
    if (agentId) {
      loadAgentData();
      loadAgencies();
    }
  }, [agentId]);

  const loadAgentData = async () => {
    if (!agentId) return;
    
    try {
      setIsLoading(true);
      const agentsData = await getAllAgents();
      const agentData = agentsData.find(a => a.id === agentId);
      const loginData = null; // Temporaire
      
      if (agentData) {
        setAgent(agentData);
        setFormData({
          name: agentData.name || '',
          badgeNumber: agentData.badgeNumber || '',
          email: agentData.email || '',
          phoneNumber: agentData.phoneNumber || '',
          address: agentData.address || '',
          emergencyContact: agentData.emergencyContact || '',
          dateOfBirth: agentData.dateOfBirth || '',
          discordId: agentData.discordId || '',
          agencyId: agentData.agencyId || '',
          gradeId: agentData.gradeId || '',
          status: agentData.status || 'active',
          candidateId: agentData.candidateId || '',
        });
        
        if (agentData.agencyId) {
          loadGrades(agentData.agencyId);
        }
      }
      
      if (loginData) {
        setAgentLogin({
          id: loginData.id,
          badgeNumber: loginData.badge_number,
          password: loginData.password,
          isActive: loginData.is_active,
          lastLogin: loginData.last_login
        });
        setLoginData({
          password: '',
          isActive: loginData.is_active
        });
      }
    } catch (error) {
      console.error('Error loading agent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'agent",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const data = await getAgencies();
      setAgencies(data);
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const loadGrades = async (agencyId: string) => {
    try {
      const data = await getAgencyGrades(agencyId);
      setGrades(data);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const handleAgencyChange = (agencyId: string) => {
    setFormData(prev => ({ ...prev, agencyId, gradeId: '' }));
    loadGrades(agencyId);
  };

  const handleSaveAgent = async () => {
    if (!agentId) return;
    
    try {
      setIsSaving(true);
      
      await updateAgent(agentId, formData);

      toast({
        title: "Succès",
        description: "Les informations de l'agent ont été mises à jour"
      });
      await loadAgentData();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'agent",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLogin = async () => {
    if (!agentId || !agent) return;
    
    try {
      setIsSaving(true);
      
      let success = false;
      
      if (agentLogin) {
        // Update existing login
        await updateAgentLogin(agentId, {
          password: loginData.password || undefined,
          isActive: loginData.isActive
        });
        success = true;
      } else {
        // Create new login
        if (!loginData.password) {
          toast({
            title: "Erreur",
            description: "Le mot de passe est requis pour créer un login",
            variant: "destructive"
          });
          return;
        }
        
        await createAgentLogin(agentId, agent.badgeNumber, loginData.password);
        success = true;
      }

      if (success) {
        toast({
          title: "Succès",
          description: agentLogin ? "Login mis à jour" : "Login créé avec succès"
        });
        await loadAgentData();
        setLoginData(prev => ({ ...prev, password: '' }));
      } else {
        throw new Error('Login operation failed');
      }
    } catch (error) {
      console.error('Error saving login:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le login",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  if (!agent) {
    return <div className="text-center text-red-500">Agent non trouvé</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/police/agents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-gray-500">Matricule: {agent.badgeNumber}</p>
          </div>
        </div>
        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
          {agent.status}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Informations</span>
          </TabsTrigger>
          <TabsTrigger value="login" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Login</span>
          </TabsTrigger>
          <TabsTrigger value="specialties" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Spécialités</span>
          </TabsTrigger>
          <TabsTrigger value="disciplines" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Discipline</span>
          </TabsTrigger>
        </TabsList>

        {/* Agent Information Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations de l'agent</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="badgeNumber">Matricule</Label>
                    <Input
                      id="badgeNumber"
                      value={formData.badgeNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, badgeNumber: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Téléphone</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discordId">Discord ID</Label>
                    <Input
                      id="discordId"
                      value={formData.discordId}
                      onChange={(e) => setFormData(prev => ({ ...prev, discordId: e.target.value }))}
                      placeholder="Ex: 556455932956246028"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agency">Agence</Label>
                    <Select value={formData.agencyId} onValueChange={handleAgencyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une agence" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={formData.gradeId} onValueChange={(value) => setFormData(prev => ({ ...prev, gradeId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: AgentStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="retired">Retraité</SelectItem>
                      <SelectItem value="training">Formation</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="candidateId">ID du candidat</Label>
                    <Input
                      id="candidateId"
                      value={formData.candidateId}
                      onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAgent} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login Management Tab */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Gestion du login</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {agentLogin && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut du login:</span>
                    <Badge variant={agentLogin.isActive ? 'default' : 'secondary'}>
                      {agentLogin.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  {agentLogin.lastLogin && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Dernière connexion:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(agentLogin.lastLogin).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">
                    {agentLogin ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={agentLogin ? 'Nouveau mot de passe...' : 'Mot de passe...'}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={loginData.isActive}
                    onCheckedChange={(checked) => setLoginData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Login actif</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveLogin} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : agentLogin ? 'Mettre à jour' : 'Créer le login'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specialties Tab */}
        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Spécialités de l'agent</span>
                </CardTitle>
                {agent.agencyId && (
                  <AssignSpecialtyDialog agentId={agentId!} agencyId={agent.agencyId} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {specialtiesLoading ? (
                <div>Chargement...</div>
              ) : specialties.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Aucune spécialité assignée à cet agent
                </div>
              ) : (
                <div className="space-y-4">
                  {specialties.map((specialty) => (
                    <div key={specialty.id} className="border rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{specialty.specialtyName}</h3>
                        {specialty.specialtyDescription && (
                          <p className="text-sm text-gray-600 mt-1">{specialty.specialtyDescription}</p>
                        )}
                        <div className="text-sm text-gray-500 mt-2">
                          <div>Assigné par: {specialty.assignedBy}</div>
                          <div>Date: {new Date(specialty.assignedDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSpecialtyMutation.mutate(specialty.id)}
                        disabled={removeSpecialtyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disciplines Tab */}
        <TabsContent value="disciplines">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Dossier Disciplinaire</span>
                </CardTitle>
                <AddDisciplineDialog agentId={agentId!} />
              </div>
            </CardHeader>
            <CardContent>
              {disciplinesLoading ? (
                <div>Chargement...</div>
              ) : disciplines.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Aucun dossier disciplinaire pour cet agent
                </div>
              ) : (
                <div className="space-y-4">
                  {disciplines.map((record) => (
                    <div 
                      key={record.id} 
                      className={`border rounded-lg p-4 ${getDisciplineColor(record.type)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-semibold">
                          {getDisciplineLabel(record.type)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{record.reason}</p>
                      <p className="text-xs text-gray-500">Émis par: {record.issuedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDetail;
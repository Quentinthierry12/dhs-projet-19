
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  identifiant: string;
  active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Candidate {
  id: string;
  name: string;
  serverId: string;
  isCertified: boolean;
  certifiedBy?: string;
  certificationDate?: string;
  classIds: string[];
  createdAt: string;
  moduleScores: SubModuleScore[];
}

export interface Class {
  id: string;
  name: string;
  instructorName: string;
  candidateIds: string[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  orderNumber: number;
  order: number;
  instructorInCharge?: string;
  createdAt: string;
  subModules?: SubModule[];
}

export interface SubModule {
  id: string;
  moduleId: string;
  name: string;
  orderNumber: number;
  order: number;
  maxScore: number;
  isOptional?: boolean;
  appreciation?: string;
  createdAt: string;
}

export interface SubModuleScore {
  id: string;
  candidateId: string;
  subModuleId: string;
  score: number;
  maxScore: number;
  comment?: string;
  instructorId?: string;
  timestamp: string;
}

export interface SubModuleAppreciation {
  id: string;
  candidateId: string;
  subModuleId: string;
  appreciation?: string;
  instructorId?: string;
  createdAt: string;
  updatedAt: string;
}

// Police types
export interface Agency {
  id: string;
  name: string;
  acronym: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  name: string;
  agencyId: string;
  order: number;
  authorityLevel?: number;
  createdAt: string;
}

export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'retired' | 'training';

export interface PoliceAgent {
  id: string;
  name: string;
  badgeNumber: string;
  agencyId: string;
  gradeId: string;
  status: AgentStatus;
  candidateId?: string;
  createdAt: string;
  agencyName?: string;
  gradeName?: string;
}

export interface SpecializedTraining {
  id: string;
  title: string;
  description?: string;
  agencyId: string;
  createdAt: string;
  agencyName?: string;
}

export interface TrainingModule {
  id: string;
  trainingId: string;
  title: string;
  description?: string;
  orderNumber: number;
  maxScore?: number;
  createdAt: string;
}

export interface AgentTraining {
  id: string;
  agentId: string;
  trainingId: string;
  completionDate: string;
  validatedBy: string;
  score?: number;
  completedModules?: string[];
  agentName?: string;
  trainingTitle?: string;
}

export type DisciplinaryType = 'warning' | 'reprimand' | 'suspension' | 'termination';

export interface DisciplinaryRecord {
  id: string;
  agentId: string;
  type: DisciplinaryType;
  date: string;
  issuedAt?: string;
  reason: string;
  issuedBy: string;
  createdAt: string;
  agentName?: string;
  agencyName?: string;
}

export interface DisciplinaryTemplate {
  id: string;
  title: string;
  type: DisciplinaryType;
  content: string;
  createdAt: string;
  agencyId?: string;
  createdBy: string;
}

export interface CompetitionParticipationResult {
  id: string;
  competitionId: string;
  competitionTitle: string;
  participantName: string;
  participantRio?: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  comment?: string;
}

export interface SystemStatus {
  id: string;
  lastCheck: string;
  status: string;
  details: Record<string, any>;
}

export interface SystemTemplateConfig {
  modules: boolean;
  disciplines: boolean;
  agencies: boolean;
  grades: boolean;
  trainings: boolean;
}

// Application system types
export type FieldType = 'text' | 'textarea' | 'select' | 'rating' | 'number' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  maxPoints?: number;
  placeholder?: string;
}

export interface ApplicationForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface FieldResponse {
  fieldId: string;
  label: string;
  value: string;
  type: FieldType;
  score?: number;
  comment?: string;
}

export interface Application {
  id: string;
  formId: string;
  formName: string;
  applicantName: string;
  serverId: string;
  responses: FieldResponse[];
  status: ApplicationStatus;
  totalScore?: number;
  maxPossibleScore?: number;
  reviewerComment?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  description?: string;
  agencyId: string;
  moduleIds: string[];
  competitionIds: string[];
  createdAt: string;
  updatedAt: string;
}

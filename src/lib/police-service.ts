import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "./activity-logger";
import type { DisciplinaryRecord, DisciplinaryType } from "@/types/police";

// Types pour les entités police
export type AgentStatus = 'active' | 'inactive' | 'suspended' | 'retired' | 'training';

export interface PoliceAgent {
  id: string;
  name: string;
  badgeNumber: string;
  agencyId: string;
  gradeId: string;
  status: AgentStatus;
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  address?: string;
  discordId?: string;
  createdAt: string;
  updatedAt: string;
  agencyName?: string;
  gradeName?: string;
  candidateId?: string;
}

export interface PoliceAgency {
  id: string;
  name: string;
  acronym: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoliceGrade {
  id: string;
  name: string;
  orderNumber: number;
  authorityLevel?: number;
  agencyId: string;
  createdAt: string;
  updatedAt: string;
}

// Nouveaux types pour les nouvelles fonctionnalités
export interface AgentLogin {
  id: string;
  agentId: string;
  badgeNumber: string;
  password: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Uniform {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  agencyId?: string;
  maskFacialHair: number;
  handsUpperBody: number;
  legsPants: number;
  bagsParachutes: number;
  shoes: number;
  neckScarfs: number;
  shirtAccessories: number;
  bodyArmorAccessories: number;
  badgesLogos?: string;
  shirtOverlayJackets: number;
  hatsHelmets: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternalMessage {
  id: string;
  senderId?: string;
  senderEmail: string;
  recipientEmails: string[];
  subject: string;
  content: string;
  isGroupMessage: boolean;
  mailingListId?: string;
  sentAt: string;
  readBy: string[];
  createdAt: string;
}

export interface MailingList {
  id: string;
  name: string;
  groupEmail?: string;
  description?: string;
  memberEmails: string[];
  createdBy: string;
  agencyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Obtenir tous les agents de police
export async function getPoliceAgents() {
  const { data, error } = await supabase
    .from('dhs_police_agents')
    .select(`
      *,
      dhs_agencies!agency_id(name),
      dhs_grades!grade_id(name)
    `)
    .order('name');

  if (error) throw error;

  return data.map(agent => ({
    ...agent,
    agencyName: agent.dhs_agencies?.name,
    gradeName: agent.dhs_grades?.name,
    badgeNumber: agent.badge_number,
    agencyId: agent.agency_id,
    gradeId: agent.grade_id,
    candidateId: agent.candidate_id,
    phoneNumber: agent.phone_number,
    emergencyContact: agent.emergency_contact,
    dateOfBirth: agent.date_of_birth,
    discordId: agent["Discord ID"],
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
    status: agent.status as AgentStatus,
  }));
}

// Alias pour la compatibilité
export const getAllPoliceAgents = getPoliceAgents;
export const getAgents = getPoliceAgents;
export const getAllAgents = getPoliceAgents;

// Obtenir un agent par ID
export async function getPoliceAgentById(id: string) {
  const { data, error } = await supabase
    .from('dhs_police_agents')
    .select(`
      *,
      dhs_agencies!agency_id(name),
      dhs_grades!grade_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    agencyName: data.dhs_agencies?.name,
    gradeName: data.dhs_grades?.name,
    badgeNumber: data.badge_number,
    agencyId: data.agency_id,
    gradeId: data.grade_id,
    candidateId: data.candidate_id,
    phoneNumber: data.phone_number,
    emergencyContact: data.emergency_contact,
    dateOfBirth: data.date_of_birth,
    discordId: data["Discord ID"],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    status: data.status as AgentStatus,
  };
}

// Rechercher un agent par badge ou téléphone
export async function searchAgents(query: string) {
  const { data, error } = await supabase
    .from('dhs_police_agents')
    .select(`
      *,
      dhs_agencies!agency_id(name),
      dhs_grades!grade_id(name)
    `)
    .or(`badge_number.ilike.%${query}%,phone_number.ilike.%${query}%,name.ilike.%${query}%`)
    .order('name');

  if (error) throw error;

  return data.map(agent => ({
    ...agent,
    agencyName: agent.dhs_agencies?.name,
    gradeName: agent.dhs_grades?.name,
    badgeNumber: agent.badge_number,
    agencyId: agent.agency_id,
    gradeId: agent.grade_id,
    phoneNumber: agent.phone_number,
    emergencyContact: agent.emergency_contact,
    dateOfBirth: agent.date_of_birth,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
  }));
}

// Authentification d'un agent
export async function authenticateAgent(badgeNumber: string, password: string) {
  const { data, error } = await supabase
    .from('dhs_agent_logins')
    .select(`
      *,
      dhs_police_agents!agent_id(
        *,
        dhs_agencies!agency_id(name),
        dhs_grades!grade_id(name)
      )
    `)
    .eq('badge_number', badgeNumber)
    .eq('password', password)
    .eq('is_active', true)
    .single();

  if (error) throw error;

  // Mettre à jour la dernière connexion
  await supabase
    .from('dhs_agent_logins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id);

  const agent = data.dhs_police_agents;
  return {
    ...agent,
    agencyName: agent.dhs_agencies?.name,
    gradeName: agent.dhs_grades?.name,
    badgeNumber: agent.badge_number,
    agencyId: agent.agency_id,
    gradeId: agent.grade_id,
    phoneNumber: agent.phone_number,
    emergencyContact: agent.emergency_contact,
    dateOfBirth: agent.date_of_birth,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
  };
}

// Créer un login pour un agent
export async function createAgentLogin(agentId: string, badgeNumber: string, password: string) {
  const { data, error } = await supabase
    .from('dhs_agent_logins')
    .insert({
      agent_id: agentId,
      badge_number: badgeNumber,
      password: password,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Mettre à jour un login d'agent
export async function updateAgentLogin(agentId: string, data: { password?: string; isActive?: boolean }) {
  const updateData: any = {};
  if (data.password) updateData.password = data.password;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: result, error } = await supabase
    .from('dhs_agent_logins')
    .update(updateData)
    .eq('agent_id', agentId)
    .select()
    .single();

  if (error) throw error;
  return result;
}

// Obtenir le login d'un agent
export async function getAgentLogin(agentId: string) {
  const { data, error } = await supabase
    .from('dhs_agent_logins')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateAgent(agentId: string, agent: Partial<PoliceAgent>) {
  const updateData: any = {};
  if (agent.name) updateData.name = agent.name;
  if (agent.badgeNumber) updateData.badge_number = agent.badgeNumber;
  if (agent.email) updateData.email = agent.email;
  if (agent.phoneNumber) updateData.phone_number = agent.phoneNumber;
  if (agent.address) updateData.address = agent.address;
  if (agent.emergencyContact) updateData.emergency_contact = agent.emergencyContact;
  if (agent.dateOfBirth) updateData.date_of_birth = agent.dateOfBirth;
  if (agent.discordId) updateData["Discord ID"] = agent.discordId;
  if (agent.agencyId) updateData.agency_id = agent.agencyId;
  if (agent.gradeId) updateData.grade_id = agent.gradeId;
  if (agent.status) updateData.status = agent.status;

  const { data, error } = await supabase
    .from('dhs_police_agents')
    .update(updateData)
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;

  // Si le matricule a été modifié, mettre à jour aussi dans agent_logins
  if (agent.badgeNumber) {
    const { error: loginError } = await supabase
      .from('dhs_agent_logins')
      .update({ badge_number: agent.badgeNumber })
      .eq('agent_id', agentId);
    
    if (loginError) {
      console.error('Erreur lors de la mise à jour du matricule dans agent_logins:', loginError);
    }
  }

  return data;
}

// Obtenir toutes les agences
export async function getPoliceAgencies() {
  const { data, error } = await supabase
    .from('dhs_agencies')
    .select('*')
    .order('name');

  if (error) throw error;
  
  return data.map(agency => ({
    ...agency,
    logoUrl: agency.logo_url,
    createdAt: agency.created_at,
    updatedAt: agency.updated_at,
  }));
}

// Alias pour la compatibilité
export const getAllPoliceAgencies = getPoliceAgencies;
export const getAgencies = getPoliceAgencies;
export const getAllAgencies = getPoliceAgencies;

// Obtenir une agence par ID
export async function getAgencyById(id: string) {
  const { data, error } = await supabase
    .from('dhs_agencies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    logoUrl: data.logo_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Créer une agence
export async function createPoliceAgency(agency: { name: string; acronym: string; logoUrl?: string }) {
  const { data, error } = await supabase
    .from('dhs_agencies')
    .insert({
      name: agency.name,
      acronym: agency.acronym,
      logo_url: agency.logoUrl,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    logoUrl: data.logo_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Alias pour la compatibilité
export const createAgency = createPoliceAgency;

// Mettre à jour une agence
export async function updateAgency(agencyId: string, agency: Partial<PoliceAgency>) {
  const updateData: any = {};
  if (agency.name) updateData.name = agency.name;
  if (agency.acronym) updateData.acronym = agency.acronym;
  if (agency.logoUrl !== undefined) updateData.logo_url = agency.logoUrl;

  const { data, error } = await supabase
    .from('dhs_agencies')
    .update(updateData)
    .eq('id', agencyId)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    logoUrl: data.logo_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Obtenir tous les grades
export async function getPoliceGrades() {
  const { data, error } = await supabase
    .from('dhs_grades')
    .select('*')
    .order('order_number');

  if (error) throw error;
  
  return data.map(grade => ({
    ...grade,
    order: grade.order_number,
    orderNumber: grade.order_number,
    authorityLevel: grade.authority_level,
    agencyId: grade.agency_id,
    createdAt: grade.created_at,
    updatedAt: grade.updated_at,
  }));
}

// Alias pour la compatibilité
export const getAllPoliceGrades = getPoliceGrades;
export const getAgencyGrades = getGradesByAgency;

// Obtenir les grades par agence
export async function getGradesByAgency(agencyId: string) {
  const { data, error } = await supabase
    .from('dhs_grades')
    .select('*')
    .eq('agency_id', agencyId)
    .order('order_number');

  if (error) throw error;
  
  return data.map(grade => ({
    ...grade,
    order: grade.order_number,
    orderNumber: grade.order_number,
    authorityLevel: grade.authority_level,
    agencyId: grade.agency_id,
    createdAt: grade.created_at,
    updatedAt: grade.updated_at,
  }));
}

// Ajouter un grade
export async function addGrade(data: { name: string; agencyId: string; orderNumber: number; authorityLevel?: number }) {
  const { data: result, error } = await supabase
    .from('dhs_grades')
    .insert({
      name: data.name,
      agency_id: data.agencyId,
      order_number: data.orderNumber,
      authority_level: data.authorityLevel,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...result,
    orderNumber: result.order_number,
    authorityLevel: result.authority_level,
    agencyId: result.agency_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

// Obtenir les agents par agence
export async function getAgentsByAgency(agencyId: string) {
  const { data, error } = await supabase
    .from('dhs_police_agents')
    .select('*')
    .eq('agency_id', agencyId);

  if (error) throw error;
  
  return data.map(agent => ({
    ...agent,
    badgeNumber: agent.badge_number,
    agencyId: agent.agency_id,
    gradeId: agent.grade_id,
    candidateId: agent.candidate_id,
    phoneNumber: agent.phone_number,
    emergencyContact: agent.emergency_contact,
    dateOfBirth: agent.date_of_birth,
    createdAt: agent.created_at,
    updatedAt: agent.updated_at,
  }));
}

// Créer un agent
export async function createPoliceAgent(agent: {
  name: string;
  badgeNumber: string;
  agencyId: string;
  gradeId: string;
  status: string;
  candidateId?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  address?: string;
}) {
  const { data, error } = await supabase
    .from('dhs_police_agents')
    .insert({
      name: agent.name,
      badge_number: agent.badgeNumber,
      agency_id: agent.agencyId,
      grade_id: agent.gradeId,
      status: agent.status,
      candidate_id: agent.candidateId,
      phone_number: agent.phoneNumber,
      emergency_contact: agent.emergencyContact,
      date_of_birth: agent.dateOfBirth,
      address: agent.address,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    badgeNumber: data.badge_number,
    agencyId: data.agency_id,
    gradeId: data.grade_id,
    candidateId: data.candidate_id,
    phoneNumber: data.phone_number,
    emergencyContact: data.emergency_contact,
    dateOfBirth: data.date_of_birth,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Alias pour la compatibilité
export const createAgent = createPoliceAgent;

// Supprimer un agent
export async function deletePoliceAgent(id: string) {
  const { error } = await supabase
    .from('dhs_police_agents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Obtenir les spécialités d'un agent
export async function getAgentSpecialties(agentId: string) {
  const { data, error } = await supabase
    .from('dhs_agent_specialties')
    .select(`
      *,
      dhs_specialties!specialty_id(name, description)
    `)
    .eq('agent_id', agentId)
    .eq('is_active', true);

  if (error) throw error;

  return data.map(specialty => ({
    id: specialty.id,
    specialtyId: specialty.specialty_id,
    specialtyName: specialty.dhs_specialties?.name,
    specialtyDescription: specialty.dhs_specialties?.description,
    assignedDate: specialty.assigned_date,
    assignedBy: specialty.assigned_by,
    isActive: specialty.is_active,
  }));
}

// Assigner une spécialité à un agent
export async function assignSpecialtyToAgent(assignment: {
  agentId: string;
  specialtyId: string;
  assignedBy: string;
}) {
  const { data, error } = await supabase
    .from('dhs_agent_specialties')
    .insert({
      agent_id: assignment.agentId,
      specialty_id: assignment.specialtyId,
      assigned_by: assignment.assignedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Retirer une spécialité d'un agent
export async function removeSpecialtyFromAgent(specialtyAssignmentId: string) {
  const { error } = await supabase
    .from('dhs_agent_specialties')
    .update({ is_active: false })
    .eq('id', specialtyAssignmentId);

  if (error) throw error;
}

// Obtenir les spécialités par agence
export async function getSpecialtiesByAgency(agencyId: string) {
  const { data, error } = await supabase
    .from('dhs_specialties')
    .select('*')
    .eq('agency_id', agencyId)
    .order('name');

  if (error) throw error;
  return data;
}

// CORRECTION DU BUG: Obtenir les formations d'un agent avec une jointure correcte
export async function getAgentTrainings(agentId: string) {
  const { data, error } = await supabase
    .from('dhs_agent_trainings')
    .select(`
      id,
      agent_id,
      training_id,
      completion_date,
      validated_by,
      score,
      status,
      dhs_specialized_trainings (
        id,
        title,
        description
      )
    `)
    .eq('agent_id', agentId)
    .order('completion_date', { ascending: false });

  if (error) throw error;

  return data.map(training => ({
    id: training.id,
    agentId: training.agent_id,
    trainingId: training.training_id,
    trainingTitle: (training as any).dhs_specialized_trainings?.title || 'Formation inconnue',
    completionDate: training.completion_date,
    validatedBy: training.validated_by,
    score: training.score,
    status: training.status || 'completed',
  }));
}

// Assigner une formation à un agent
export async function assignTrainingToAgent(assignment: {
  agentId: string;
  trainingId: string;
  completionDate: string;
  validatedBy: string;
  score?: number;
}) {
  const { data, error } = await supabase
    .from('dhs_agent_trainings')
    .insert({
      agent_id: assignment.agentId,
      training_id: assignment.trainingId,
      completion_date: assignment.completionDate,
      validated_by: assignment.validatedBy,
      score: assignment.score,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Obtenir les formations spécialisées
export async function getSpecializedTrainings() {
  const { data, error } = await supabase
    .from('dhs_specialized_trainings')
    .select('*')
    .order('title');

  if (error) throw error;
  return data;
}

// Obtenir toutes les formations
export async function getAllTrainings() {
  const { data, error } = await supabase
    .from('dhs_specialized_trainings')
    .select(`
      *,
      dhs_agencies!agency_id(name)
    `)
    .order('title');

  if (error) throw error;
  
  return data.map(training => ({
    ...training,
    agencyName: training.dhs_agencies?.name,
    createdAt: training.created_at,
    updatedAt: training.updated_at,
  }));
}

// Obtenir une formation par ID
export async function getTrainingById(id: string) {
  const { data, error } = await supabase
    .from('dhs_specialized_trainings')
    .select(`
      *,
      dhs_agencies!agency_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    agencyName: data.dhs_agencies?.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Créer une formation
export async function createTraining(training: {
  title: string;
  description?: string;
  agencyId: string;
}) {
  const { data, error } = await supabase
    .from('dhs_specialized_trainings')
    .insert({
      title: training.title,
      description: training.description,
      agency_id: training.agencyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Obtenir les modules d'une formation
export async function getTrainingModules(trainingId: string) {
  const { data, error } = await supabase
    .from('dhs_training_modules')
    .select('*')
    .eq('training_id', trainingId)
    .order('order_number');

  if (error) throw error;
  
  return data.map(module => ({
    ...module,
    trainingId: module.training_id,
    orderNumber: module.order_number,
    maxScore: module.max_score,
    createdAt: module.created_at,
    updatedAt: module.updated_at,
  }));
}

// Créer un module de formation
export async function createTrainingModule(module: {
  trainingId: string;
  title: string;
  description?: string;
  orderNumber: number;
  maxScore?: number;
}) {
  const { data, error } = await supabase
    .from('dhs_training_modules')
    .insert({
      training_id: module.trainingId,
      title: module.title,
      description: module.description,
      order_number: module.orderNumber,
      max_score: module.maxScore,
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    trainingId: data.training_id,
    orderNumber: data.order_number,
    maxScore: data.max_score,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Mettre à jour un module de formation
export async function updateTrainingModule(module: {
  id: string;
  trainingId: string;
  title: string;
  description?: string;
  orderNumber: number;
  maxScore?: number;
  createdAt: string;
}) {
  const { data, error } = await supabase
    .from('dhs_training_modules')
    .update({
      title: module.title,
      description: module.description,
      order_number: module.orderNumber,
      max_score: module.maxScore,
    })
    .eq('id', module.id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    trainingId: data.training_id,
    orderNumber: data.order_number,
    maxScore: data.max_score,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Supprimer un module de formation
export async function deleteTrainingModule(moduleId: string) {
  const { error } = await supabase
    .from('dhs_training_modules')
    .delete()
    .eq('id', moduleId);

  if (error) throw error;
}

// Obtenir les dossiers disciplinaires d'un agent
export async function getAgentDisciplinaryRecords(agentId: string): Promise<DisciplinaryRecord[]> {
  const { data, error } = await supabase
    .from('dhs_disciplinary_records')
    .select('*')
    .eq('agent_id', agentId)
    .order('date', { ascending: false });

  if (error) throw error;
  
  return data.map((record): DisciplinaryRecord => ({
    id: record.id,
    agentId: record.agent_id,
    type: record.type as DisciplinaryType,
    date: record.date,
    reason: record.reason,
    issuedBy: record.issued_by,
    createdAt: record.created_at,
    issuedAt: record.issued_at || record.date,
  }));
}

// Obtenir tous les dossiers disciplinaires
export async function getDisciplinaryRecords(): Promise<DisciplinaryRecord[]> {
  const { data, error } = await supabase
    .from('dhs_disciplinary_records')
    .select(`
      *,
      dhs_police_agents!agent_id(name, badge_number)
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  
  return data.map((record): DisciplinaryRecord => ({
    id: record.id,
    agentId: record.agent_id,
    type: record.type as DisciplinaryType,
    date: record.date,
    reason: record.reason,
    issuedBy: record.issued_by,
    createdAt: record.created_at,
    issuedAt: record.issued_at || record.date,
    agentName: record.dhs_police_agents?.name,
  }));
}

// Alias pour la compatibilité
export const getAllDisciplinaryRecords = getDisciplinaryRecords;

// Obtenir tous les modèles disciplinaires
export async function getAllDisciplinaryTemplates() {
  const { data, error } = await supabase
    .from('dhs_disciplinary_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(template => ({
    ...template,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
    createdBy: template.created_by,
    agencyId: template.agency_id,
  }));
}

// Supprimer un modèle disciplinaire
export async function deleteDisciplinaryTemplate(id: string) {
  const { error } = await supabase
    .from('dhs_disciplinary_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Créer un modèle disciplinaire
export async function createDisciplinaryTemplate(template: {
  title: string;
  type: string;
  content: string;
  createdBy: string;
  agencyId?: string;
}) {
  const { data, error } = await supabase
    .from('dhs_disciplinary_templates')
    .insert({
      title: template.title,
      type: template.type,
      content: template.content,
      created_by: template.createdBy,
      agency_id: template.agencyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Obtenir les résultats de compétition
export async function getCompetitionResults() {
  const { data, error } = await supabase
    .from('dhs_competition_participations')
    .select(`
      *,
      dhs_competitions!competition_id(title)
    `)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  
  return data.map(result => ({
    id: result.id,
    competitionId: result.competition_id,
    competitionTitle: result.dhs_competitions?.title || 'Compétition inconnue',
    participantName: result.participant_name,
    participantRio: result.participant_rio,
    score: result.total_score,
    maxScore: result.max_possible_score,
    percentage: Math.round((result.total_score / result.max_possible_score) * 100),
    status: result.status,
    submittedAt: result.submitted_at,
  }));
}

// Configuration des modèles système
export interface SystemTemplateConfig {
  modules: boolean;
  disciplines: boolean;
  agencies: boolean;
  grades: boolean;
  trainings: boolean;
}

// Obtenir la configuration des modèles système
export async function getSystemTemplates(): Promise<SystemTemplateConfig> {
  // Retourner une configuration par défaut pour l'instant
  return {
    modules: true,
    disciplines: true,
    agencies: true,
    grades: true,
    trainings: true,
  };
}

// Mettre à jour la configuration des modèles système
export async function updateSystemTemplates(config: SystemTemplateConfig) {
  // Pour l'instant, on simule la mise à jour
  console.log('Configuration mise à jour:', config);
  return config;
}

// NOUVELLES FONCTIONS POUR LES TENUES
export async function getUniforms() {
  const { data, error } = await supabase
    .from('dhs_uniforms')
    .select(`
      *,
      dhs_agencies!agency_id(name)
    `)
    .order('name');

  if (error) throw error;

  return data.map(uniform => ({
    id: uniform.id,
    name: uniform.name,
    description: uniform.description,
    imageUrl: uniform.image_url,
    agencyId: uniform.agency_id,
    agencyName: uniform.dhs_agencies?.name,
    maskFacialHair: uniform.mask_facial_hair,
    handsUpperBody: uniform.hands_upper_body,
    legsPants: uniform.legs_pants,
    bagsParachutes: uniform.bags_parachutes,
    shoes: uniform.shoes,
    neckScarfs: uniform.neck_scarfs,
    shirtAccessories: uniform.shirt_accessories,
    bodyArmorAccessories: uniform.body_armor_accessories,
    badgesLogos: uniform.badges_logos,
    shirtOverlayJackets: uniform.shirt_overlay_jackets,
    hatsHelmets: uniform.hats_helmets,
    createdBy: uniform.created_by,
    createdAt: uniform.created_at,
    updatedAt: uniform.updated_at,
  }));
}

export async function createUniform(uniform: {
  name: string;
  description?: string;
  imageUrl?: string;
  agencyId?: string;
  maskFacialHair?: number;
  handsUpperBody?: number;
  legsPants?: number;
  bagsParachutes?: number;
  shoes?: number;
  neckScarfs?: number;
  shirtAccessories?: number;
  bodyArmorAccessories?: number;
  badgesLogos?: string;
  shirtOverlayJackets?: number;
  hatsHelmets?: number;
  createdBy: string;
}) {
  const { data, error } = await supabase
    .from('dhs_uniforms')
    .insert({
      name: uniform.name,
      description: uniform.description,
      image_url: uniform.imageUrl,
      agency_id: uniform.agencyId,
      mask_facial_hair: uniform.maskFacialHair ?? 1,
      hands_upper_body: uniform.handsUpperBody ?? 5,
      legs_pants: uniform.legsPants ?? 21,
      bags_parachutes: uniform.bagsParachutes ?? 18,
      shoes: uniform.shoes ?? 19,
      neck_scarfs: uniform.neckScarfs ?? 317,
      shirt_accessories: uniform.shirtAccessories ?? 58,
      body_armor_accessories: uniform.bodyArmorAccessories ?? 228,
      badges_logos: uniform.badgesLogos,
      shirt_overlay_jackets: uniform.shirtOverlayJackets ?? 31,
      hats_helmets: uniform.hatsHelmets ?? 46,
      created_by: uniform.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// NOUVELLES FONCTIONS POUR LA MESSAGERIE INTERNE
export async function sendInternalMessage(message: {
  senderEmail: string;
  recipientEmails: string[];
  subject: string;
  content: string;
  senderId?: string;
  isGroupMessage?: boolean;
  mailingListId?: string;
}) {
  const { data, error } = await supabase
    .from('dhs_internal_messages')
    .insert({
      sender_id: message.senderId,
      sender_email: message.senderEmail,
      recipient_emails: message.recipientEmails,
      subject: message.subject,
      content: message.content,
      is_group_message: message.isGroupMessage ?? false,
      mailing_list_id: message.mailingListId,
    })
    .select()
    .single();

  if (error) throw error;

  // Envoyer le webhook Discord après l'envoi du message
  try {
    // Récupérer les informations de l'expéditeur
    const { data: senderAgent } = await supabase
      .from('dhs_police_agents')
      .select('name, discord_id')
      .eq('id', message.senderId)
      .single();

    // Résoudre les emails de groupes en emails individuels
    let finalRecipientEmails = [...message.recipientEmails];

    for (const email of message.recipientEmails) {
      // Vérifier si c'est un email de groupe (liste de diffusion)
      const { data: mailingList } = await supabase
        .from('dhs_mailing_lists')
        .select('member_emails')
        .eq('group_email', email)
        .eq('is_active', true)
        .single();

      if (mailingList && mailingList.member_emails) {
        // Remplacer l'email de groupe par les emails des membres
        finalRecipientEmails = finalRecipientEmails.filter(e => e !== email);
        finalRecipientEmails.push(...mailingList.member_emails);
      }
    }

    // Récupérer les Discord IDs des destinataires finaux
    const { data: recipientAgents } = await supabase
      .from('dhs_police_agents')
      .select('email, discord_id')
      .in('email', finalRecipientEmails);

    if (recipientAgents && recipientAgents.length > 0) {
      const discordIds = recipientAgents
        .filter(agent => agent.discord_id)
        .map(agent => agent.discord_id);

      if (discordIds.length > 0 || senderAgent?.discord_id) {
        await supabase.functions.invoke('send-discord-notification', {
          body: {
            senderEmail: message.senderEmail,
            senderName: senderAgent?.name,
            senderDiscordId: senderAgent?.discord_id,
            recipientEmails: message.recipientEmails,
            recipientDiscordIds: discordIds,
            subject: message.subject,
            content: message.content
          }
        });
      }
    }
  } catch (webhookError) {
    console.error('Erreur lors de l\'envoi du webhook Discord:', webhookError);
  }

  return data;
}

export async function getInternalMessages(userEmail: string) {
  const { data, error } = await supabase
    .from('dhs_internal_messages')
    .select(`
      *,
      dhs_police_agents!sender_id(name, badge_number)
    `)
    .contains('recipient_emails', [userEmail])
    .order('sent_at', { ascending: false });

  if (error) throw error;

  return data.map(message => ({
    id: message.id,
    senderId: message.sender_id,
    senderName: message.dhs_police_agents?.name,
    senderBadge: message.dhs_police_agents?.badge_number,
    senderEmail: message.sender_email,
    recipientEmails: message.recipient_emails,
    subject: message.subject,
    content: message.content,
    isGroupMessage: message.is_group_message,
    sentAt: message.sent_at,
    readBy: message.read_by,
    isRead: message.read_by?.includes(userEmail) ?? false,
    createdAt: message.created_at,
  }));
}

export async function markMessageAsRead(messageId: string, userEmail: string) {
  // Récupérer le message actuel
  const { data: message, error: fetchError } = await supabase
    .from('dhs_internal_messages')
    .select('read_by')
    .eq('id', messageId)
    .single();

  if (fetchError) throw fetchError;

  const currentReadBy = message.read_by || [];
  if (!currentReadBy.includes(userEmail)) {
    const { error } = await supabase
      .from('dhs_internal_messages')
      .update({ read_by: [...currentReadBy, userEmail] })
      .eq('id', messageId);

    if (error) throw error;
  }
}

export async function createMailingList(mailingList: {
  name: string;
  groupEmail?: string;
  description?: string;
  memberEmails: string[];
  createdBy: string;
  agencyId?: string;
}) {
  const { data, error } = await supabase
    .from('dhs_mailing_lists')
    .insert({
      name: mailingList.name,
      group_email: mailingList.groupEmail,
      description: mailingList.description,
      member_emails: mailingList.memberEmails,
      created_by: mailingList.createdBy,
      agency_id: mailingList.agencyId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMailingLists() {
  const { data, error } = await supabase
    .from('dhs_mailing_lists')
    .select(`
      *,
      dhs_agencies!agency_id(name)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return data.map(list => ({
    id: list.id,
    name: list.name,
    groupEmail: list.group_email,
    description: list.description,
    memberEmails: list.member_emails,
    createdBy: list.created_by,
    agencyId: list.agency_id,
    agencyName: list.dhs_agencies?.name,
    isActive: list.is_active,
    createdAt: list.created_at,
    updatedAt: list.updated_at,
  }));
}

export async function updateMailingList(id: string, updates: {
  name?: string;
  groupEmail?: string;
  description?: string;
  memberEmails?: string[];
}) {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.groupEmail !== undefined) updateData.group_email = updates.groupEmail;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.memberEmails !== undefined) updateData.member_emails = updates.memberEmails;

  const { data, error } = await supabase
    .from('dhs_mailing_lists')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      dhs_agencies!agency_id(name)
    `)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    groupEmail: data.group_email,
    description: data.description,
    memberEmails: data.member_emails,
    createdBy: data.created_by,
    agencyId: data.agency_id,
    agencyName: data.dhs_agencies?.name,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteMailingList(id: string) {
  const { error } = await supabase
    .from('dhs_mailing_lists')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

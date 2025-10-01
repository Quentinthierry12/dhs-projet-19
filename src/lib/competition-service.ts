import { supabase } from "@/integrations/supabase/client";
import type { CompetitionInvitation } from "@/types/competition";

// Create a new competition
export const createCompetition = async (competition: {
  title: string;
  description?: string;
  type: 'externe' | 'interne' | 'privé';
  specialty?: string;
  maxScore: number;
  isEntryTest?: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
}) => {
  const { data, error } = await supabase
    .from('dhs_competitions')
    .insert({
      title: competition.title,
      description: competition.description,
      type: competition.type,
      specialty: competition.specialty,
      max_score: competition.maxScore,
      is_entry_test: competition.isEntryTest || false,
      start_date: competition.startDate || null,
      end_date: competition.endDate || null,
      created_by: competition.createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating competition:', error);
    throw error;
  }

  // Send Discord webhook notification
  await sendDiscordWebhook('competition_created', {
    title: data.title,
    type: data.type,
    createdBy: data.created_by,
    startDate: competition.startDate,
    endDate: competition.endDate
  });

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type as 'externe' | 'interne' | 'privé',
    specialty: data.specialty,
    maxScore: data.max_score,
    isActive: data.is_active,
    isEntryTest: data.is_entry_test || false,
    startDate: data.start_date,
    endDate: data.end_date,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Get all competitions
export const getAllCompetitions = async (onlyActive = false) => {
  let query = supabase
    .from('dhs_competitions')
    .select('*')
    .order('created_at', { ascending: false });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching competitions:', error);
    throw error;
  }

  return data.map(comp => ({
    id: comp.id,
    title: comp.title,
    description: comp.description,
    type: comp.type as 'externe' | 'interne' | 'privé',
    specialty: comp.specialty,
    maxScore: comp.max_score,
    isActive: comp.is_active,
    isEntryTest: comp.is_entry_test || false,
    startDate: comp.start_date,
    endDate: comp.end_date,
    createdBy: comp.created_by,
    createdAt: comp.created_at,
    updatedAt: comp.updated_at,
  }));
};

// Get public competitions (exclude private ones)
export const getPublicCompetitions = async (onlyActive = false) => {
  let query = supabase
    .from('dhs_competitions')
    .select('*')
    .neq('type', 'privé')
    .order('created_at', { ascending: false });

  if (onlyActive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching public competitions:', error);
    throw error;
  }

  return data.map(comp => ({
    id: comp.id,
    title: comp.title,
    description: comp.description,
    type: comp.type as 'externe' | 'interne',
    specialty: comp.specialty,
    maxScore: comp.max_score,
    isActive: comp.is_active,
    isEntryTest: comp.is_entry_test || false,
    startDate: comp.start_date,
    endDate: comp.end_date,
    createdBy: comp.created_by,
    createdAt: comp.created_at,
    updatedAt: comp.updated_at,
  }));
};

// Get competition by ID
export const getCompetitionById = async (id: string) => {
  const { data, error } = await supabase
    .from('dhs_competitions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching competition:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type as 'externe' | 'interne' | 'privé',
    specialty: data.specialty,
    maxScore: data.max_score,
    isActive: data.is_active,
    isEntryTest: data.is_entry_test || false,
    startDate: data.start_date,
    endDate: data.end_date,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Create invitations for private competition
export const createInvitations = async (competitionId: string, candidates: Array<{name: string, email?: string}>) => {
  const invitations = [];
  
  for (const candidate of candidates) {
    // Generate unique identifiers and password
    const { data: loginData } = await supabase.rpc('generate_unique_login_identifier');
    const { data: passwordData } = await supabase.rpc('generate_secure_password');
    
    const { data, error } = await supabase
      .from('dhs_competition_invitations')
      .insert({
        competition_id: competitionId,
        candidate_name: candidate.name,
        candidate_email: candidate.email,
        login_identifier: loginData,
        login_password: passwordData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }

    invitations.push({
      id: data.id,
      competitionId: data.competition_id,
      candidateName: data.candidate_name,
      candidateEmail: data.candidate_email,
      loginIdentifier: data.login_identifier,
      loginPassword: data.login_password,
      status: data.status as 'created' | 'used',
      createdAt: data.created_at,
      usedAt: data.used_at,
    });
  }

  return invitations;
};

// Get invitations for a competition
export const getCompetitionInvitations = async (competitionId: string): Promise<CompetitionInvitation[]> => {
  const { data, error } = await supabase
    .from('dhs_competition_invitations')
    .select('*')
    .eq('competition_id', competitionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }

  return data.map((invitation: any) => ({
    id: invitation.id,
    competitionId: invitation.competition_id,
    candidateName: invitation.candidate_name,
    candidateEmail: invitation.candidate_email,
    loginIdentifier: invitation.login_identifier,
    loginPassword: invitation.login_password,
    status: invitation.status as 'created' | 'used',
    createdAt: invitation.created_at,
    usedAt: invitation.used_at,
  }));
};

// Authenticate private competition access
export const authenticatePrivateCompetition = async (loginIdentifier: string, loginPassword: string) => {
  const { data, error } = await supabase
    .from('dhs_competition_invitations')
    .select(`
      *,
      dhs_competitions(*)
    `)
    .eq('login_identifier', loginIdentifier)
    .eq('login_password', loginPassword)
    .eq('status', 'created')
    .single();

  if (error) {
    console.error('Error authenticating private competition:', error);
    return null;
  }

  const competition = data.dhs_competitions;
  
  return {
    invitation: {
      id: data.id,
      competitionId: data.competition_id,
      candidateName: data.candidate_name,
      candidateEmail: data.candidate_email,
      loginIdentifier: data.login_identifier,
      loginPassword: data.login_password,
      status: data.status as 'created' | 'used',
      createdAt: data.created_at,
      usedAt: data.used_at,
    },
    competition: {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      type: competition.type as 'externe' | 'interne' | 'privé',
      specialty: competition.specialty,
      maxScore: competition.max_score,
      isActive: competition.is_active,
      isEntryTest: competition.is_entry_test || false,
      startDate: competition.start_date,
      endDate: competition.end_date,
      createdBy: competition.created_by,
      createdAt: competition.created_at,
      updatedAt: competition.updated_at,
    }
  };
};

// Mark invitation as used
export const markInvitationAsUsed = async (invitationId: string) => {
  const { error } = await supabase
    .from('dhs_competition_invitations')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  if (error) {
    console.error('Error marking invitation as used:', error);
    throw error;
  }
};

// Submit participation
export const submitParticipation = async (participation: {
  competitionId: string;
  participantName: string;
  participantRio?: string;
  answers: { questionId: string; answer: string; score: number; maxScore: number; }[];
}) => {
  const totalScore = participation.answers.reduce((sum, answer) => sum + answer.score, 0);
  const maxPossibleScore = participation.answers.reduce((sum, answer) => sum + answer.maxScore, 0);

  const { data, error } = await supabase
    .from('dhs_competition_participations')
    .insert({
      competition_id: participation.competitionId,
      participant_name: participation.participantName,
      participant_rio: participation.participantRio,
      answers: JSON.stringify(participation.answers),
      total_score: totalScore,
      max_possible_score: maxPossibleScore,
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting participation:', error);
    throw error;
  }

  // Send Discord webhook notification for new submission
  await sendDiscordWebhook('submission_received', {
    participantName: participation.participantName,
    competitionId: participation.competitionId,
    score: totalScore,
    maxScore: maxPossibleScore
  });

  return data;
};

// Get competition questions
export const getCompetitionQuestions = async (competitionId: string) => {
  const { data, error } = await supabase
    .from('dhs_competition_questions')
    .select('*')
    .eq('competition_id', competitionId)
    .order('order_number');

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return data.map(q => ({
    id: q.id,
    competitionId: q.competition_id,
    question: q.question,
    type: q.type as 'qcm' | 'text' | 'section',
    options: q.options ? JSON.parse(String(q.options)) : undefined,
    correctAnswer: q.correct_answer,
    maxPoints: q.max_points,
    order: q.order_number,
  }));
};

// Get competition results with proper join
export const getCompetitionResults = async () => {
  console.log('Fetching competition results...');
  
  const { data, error } = await supabase
    .from('dhs_competition_participations')
    .select(`
      *,
      dhs_competitions!inner(*)
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching results:', error);
    throw error;
  }

  console.log('Raw data from database:', data);

  if (!data || data.length === 0) {
    console.log('No competition results found');
    return [];
  }

  const results = data.map(result => {
    const competition = result.dhs_competitions;
    
    return {
      id: result.id,
      competitionId: competition?.id || '',
      competitionTitle: competition?.title || 'Concours inconnu',
      participantName: result.participant_name,
      participantRio: result.participant_rio,
      score: result.total_score,
      maxScore: result.max_possible_score,
      percentage: result.max_possible_score > 0 ? Math.round((result.total_score / result.max_possible_score) * 100) : 0,
      comment: result.comment,
      submittedAt: result.submitted_at,
    };
  });

  console.log('Processed results:', results);
  return results;
};

// Create LETC candidate from competition result
export const createCandidateFromCompetition = async (participationId: string) => {
  const { data: participation, error: participationError } = await supabase
    .from('dhs_competition_participations')
    .select(`
      *,
      dhs_competitions!inner(*)
    `)
    .eq('id', participationId)
    .single();

  if (participationError) {
    console.error('Error fetching participation:', participationError);
    throw participationError;
  }

  const competition = participation.dhs_competitions;
  
  // Check if this is an entry test
  if (competition.is_entry_test) {
    // Generate a unique server ID
    const serverId = Math.floor(Math.random() * 10000).toString();

    const { data, error } = await supabase
      .from('dhs_candidates')
      .insert({
        id: `candidate_${Date.now()}`,
        name: participation.participant_name,
        server_id: serverId,
        class_ids: [],
        is_certified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }

    // Send Discord webhook notification
    await sendDiscordWebhook('candidate_created', {
      candidateName: participation.participant_name,
      serverId: serverId,
      competitionTitle: competition.title,
      score: participation.total_score,
      maxScore: participation.max_possible_score
    });

    return data;
  } else {
    throw new Error('Ce concours n\'est pas un test d\'entrée LETC');
  }
};

// Discord webhook function
export const sendDiscordWebhook = async (eventType: string, data: any) => {
  const webhookUrl = 'https://discord.com/api/webhooks/1366518462268309584/iKINV7L2uKe-EUJqe_JocDPhbm-L5_TG_wLn9lT-vMD-o2w5Ixj0-pAqa2gZZBHoeSHA';
  
  let message = '';
  
  switch (eventType) {
    case 'competition_created':
      message = `🆕 **Nouveau concours créé**\n📝 Titre: ${data.title}\n🏷️ Type: ${data.type}\n👤 Créé par: ${data.createdBy}`;
      if (data.startDate) message += `\n📅 Début: ${new Date(data.startDate).toLocaleDateString('fr-FR')}`;
      if (data.endDate) message += `\n📅 Fin: ${new Date(data.endDate).toLocaleDateString('fr-FR')}`;
      break;
    
    case 'submission_received':
      message = `📥 **Nouvelle participation reçue**\n👤 Participant: ${data.participantName}\n📊 Score: ${data.score}/${data.maxScore}\n⚠️ Copie à corriger`;
      break;
    
    case 'result_graded':
      message = `✅ **Copie corrigée**\n👤 Participant: ${data.participantName}\n📊 Score final: ${data.score}/${data.maxScore} (${data.percentage}%)`;
      if (data.comment) message += `\n💬 Commentaire: ${data.comment}`;
      break;
    
    case 'candidate_created':
      message = `🎓 **Nouveau candidat LETC créé**\n👤 Nom: ${data.candidateName}\n🆔 Server ID: ${data.serverId}\n📝 Concours: ${data.competitionTitle}\n📊 Score d'entrée: ${data.score}/${data.maxScore}`;
      break;
    
    case 'disciplinary_action':
      message = `⚖️ **Sanction disciplinaire**\n👤 Agent: ${data.agentName}\n📋 Type: ${data.type}\n💼 Motif: ${data.reason}\n👮 Émise par: ${data.issuedBy}`;
      break;
    
    default:
      message = `📢 Événement: ${eventType}`;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message
      }),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
  }
};

// Check if competition is currently active based on dates
export const isCompetitionActive = (competition: any): boolean => {
  if (!competition.isActive) return false;
  
  const now = new Date();
  const startDate = competition.startDate ? new Date(competition.startDate) : null;
  const endDate = competition.endDate ? new Date(competition.endDate) : null;
  
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  
  return true;
};

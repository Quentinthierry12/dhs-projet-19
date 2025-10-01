
import { supabase } from "@/integrations/supabase/client";
import type { Quiz, QuizQuestion, QuizParticipant, QuizAttempt } from "@/types/quiz";

// Fonctions pour la gestion des quiz
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('dhs_quizzes')
    .insert({
      title: quiz.title,
      description: quiz.description,
      module_id: quiz.moduleId,
      sub_module_id: quiz.subModuleId,
      max_score: quiz.maxScore,
      time_limit: quiz.timeLimit,
      is_active: quiz.isActive,
      allow_retakes: quiz.allowRetakes,
      created_by: quiz.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizzes() {
  const { data, error } = await supabase
    .from('dhs_quizzes')
    .select(`
      *,
      dhs_modules!module_id(name),
      dhs_sub_modules!sub_module_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(quiz => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    moduleId: quiz.module_id,
    subModuleId: quiz.sub_module_id,
    maxScore: quiz.max_score,
    timeLimit: quiz.time_limit,
    isActive: quiz.is_active,
    allowRetakes: quiz.allow_retakes,
    createdBy: quiz.created_by,
    createdAt: quiz.created_at,
    updatedAt: quiz.updated_at,
    moduleName: quiz.dhs_modules?.name,
    subModuleName: quiz.dhs_sub_modules?.name,
  }));
}

export async function getQuiz(id: string) {
  const { data, error } = await supabase
    .from('dhs_quizzes')
    .select(`
      *,
      dhs_modules!module_id(name),
      dhs_sub_modules!sub_module_id(name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    moduleId: data.module_id,
    subModuleId: data.sub_module_id,
    maxScore: data.max_score,
    timeLimit: data.time_limit,
    isActive: data.is_active,
    allowRetakes: data.allow_retakes,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    moduleName: data.dhs_modules?.name,
    subModuleName: data.dhs_sub_modules?.name,
  };
}

// Fonctions pour les questions
export async function createQuizQuestion(question: Omit<QuizQuestion, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('dhs_quiz_questions')
    .insert({
      quiz_id: question.quizId,
      question: question.question,
      type: question.type,
      options: question.options,
      correct_answer: question.correctAnswer,
      points: question.points,
      order_number: question.orderNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizQuestions(quizId: string) {
  const { data, error } = await supabase
    .from('dhs_quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_number');

  if (error) throw error;

  return data.map(q => ({
    id: q.id,
    quizId: q.quiz_id,
    question: q.question,
    type: q.type as any,
    options: q.options,
    correctAnswer: q.correct_answer,
    points: q.points,
    orderNumber: q.order_number,
    createdAt: q.created_at,
  }));
}

// Fonctions pour les participants
export async function addQuizParticipant(participant: Omit<QuizParticipant, 'id' | 'createdAt' | 'candidateName'>) {
  const { data, error } = await supabase
    .from('dhs_quiz_participants')
    .insert({
      quiz_id: participant.quizId,
      candidate_id: participant.candidateId,
      external_login: participant.externalLogin,
      external_password: participant.externalPassword,
      is_completed: participant.isCompleted,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizParticipants(quizId: string) {
  const { data, error } = await supabase
    .from('dhs_quiz_participants')
    .select(`
      *,
      dhs_candidates!candidate_id(name)
    `)
    .eq('quiz_id', quizId);

  if (error) throw error;

  return data.map(p => ({
    id: p.id,
    quizId: p.quiz_id,
    candidateId: p.candidate_id,
    externalLogin: p.external_login,
    externalPassword: p.external_password,
    isCompleted: p.is_completed,
    createdAt: p.created_at,
    candidateName: p.dhs_candidates?.name,
  }));
}

// Fonctions pour les tentatives
export async function createQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('dhs_quiz_attempts')
    .insert({
      quiz_id: attempt.quizId,
      candidate_id: attempt.candidateId,
      external_login: attempt.externalLogin,
      participant_name: attempt.participantName,
      answers: attempt.answers,
      score: attempt.score,
      max_possible_score: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      started_at: attempt.startedAt,
      completed_at: attempt.completedAt,
      is_completed: attempt.isCompleted,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizAttempts(quizId: string) {
  const { data, error } = await supabase
    .from('dhs_quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(a => ({
    id: a.id,
    quizId: a.quiz_id,
    candidateId: a.candidate_id,
    externalLogin: a.external_login,
    participantName: a.participant_name,
    answers: a.answers,
    score: a.score,
    maxPossibleScore: a.max_possible_score,
    percentage: a.percentage,
    startedAt: a.started_at,
    completedAt: a.completed_at,
    isCompleted: a.is_completed,
    createdAt: a.created_at,
  }));
}

export async function updateQuizAttempt(id: string, updates: Partial<QuizAttempt>) {
  const updateData: any = {};
  
  if (updates.answers) updateData.answers = updates.answers;
  if (updates.score !== undefined) updateData.score = updates.score;
  if (updates.percentage !== undefined) updateData.percentage = updates.percentage;
  if (updates.completedAt) updateData.completed_at = updates.completedAt;
  if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

  const { data, error } = await supabase
    .from('dhs_quiz_attempts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Obtenir les modules et sous-modules pour les sélecteurs
export async function getModulesForQuiz() {
  const { data, error } = await supabase
    .from('dhs_modules')
    .select('id, name')
    .order('order_number');

  if (error) throw error;
  return data;
}

export async function getSubModulesForQuiz(moduleId?: string) {
  let query = supabase
    .from('dhs_sub_modules')
    .select('id, name, module_id')
    .order('order_number');

  if (moduleId) {
    query = query.eq('module_id', moduleId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Obtenir les candidats pour les sélecteurs
export async function getCandidatesForQuiz() {
  const { data, error } = await supabase
    .from('dhs_candidates')
    .select('id, name, server_id')
    .order('name');

  if (error) throw error;
  return data;
}

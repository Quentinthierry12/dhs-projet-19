
-- Table pour les quiz
CREATE TABLE public.dhs_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  module_id UUID REFERENCES public.dhs_modules(id),
  sub_module_id UUID REFERENCES public.dhs_sub_modules(id),
  max_score INTEGER NOT NULL DEFAULT 100,
  time_limit INTEGER, -- en minutes
  is_active BOOLEAN NOT NULL DEFAULT true,
  allow_retakes BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les questions de quiz
CREATE TABLE public.dhs_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.dhs_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, true_false, text
  options JSONB, -- pour les choix multiples
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les participants autorisés au quiz
CREATE TABLE public.dhs_quiz_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.dhs_quizzes(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.dhs_candidates(id),
  external_login TEXT, -- pour les candidats externes
  external_password TEXT, -- pour les candidats externes
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id, candidate_id),
  UNIQUE(quiz_id, external_login)
);

-- Table pour les tentatives de quiz
CREATE TABLE public.dhs_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.dhs_quizzes(id),
  candidate_id UUID REFERENCES public.dhs_candidates(id),
  external_login TEXT, -- pour les candidats externes
  participant_name TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_quiz_questions_quiz_id ON public.dhs_quiz_questions(quiz_id);
CREATE INDEX idx_quiz_participants_quiz_id ON public.dhs_quiz_participants(quiz_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.dhs_quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_candidate_id ON public.dhs_quiz_attempts(candidate_id);

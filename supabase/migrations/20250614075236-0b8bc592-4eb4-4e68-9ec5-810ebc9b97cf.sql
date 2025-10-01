
-- Disable RLS on all existing tables
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_modifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on all DHS tables
ALTER TABLE public.dhs_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_sub_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_sub_module_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_competition_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_competition_participations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_application_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_police_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_specialized_trainings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_training_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_agent_trainings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_disciplinary_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_disciplinary_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dhs_webhook_config DISABLE ROW LEVEL SECURITY;

-- Create missing DHS Users table
CREATE TABLE public.dhs_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  identifiant TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'instructeur' CHECK (role IN ('instructeur', 'direction')),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS on the new DHS Users table
ALTER TABLE public.dhs_users DISABLE ROW LEVEL SECURITY;

-- Create DHS Activity Logs table
CREATE TABLE public.dhs_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  author_id UUID,
  author_email TEXT NOT NULL,
  role TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS on Activity Logs
ALTER TABLE public.dhs_activity_logs DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_dhs_users_email ON public.dhs_users(email);
CREATE INDEX idx_dhs_users_identifiant ON public.dhs_users(identifiant);
CREATE INDEX idx_dhs_activity_logs_type ON public.dhs_activity_logs(type);
CREATE INDEX idx_dhs_activity_logs_created_at ON public.dhs_activity_logs(created_at);

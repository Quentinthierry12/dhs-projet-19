
-- Create new tables with dhs_ prefix for the new game system

-- DHS Candidates table
CREATE TABLE public.dhs_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  class_ids TEXT[] DEFAULT '{}',
  is_certified BOOLEAN DEFAULT false,
  certified_by TEXT,
  certification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Classes table
CREATE TABLE public.dhs_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instructor_name TEXT NOT NULL,
  candidate_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Modules table
CREATE TABLE public.dhs_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Sub Modules table
CREATE TABLE public.dhs_sub_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.dhs_modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Sub Module Scores table
CREATE TABLE public.dhs_sub_module_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.dhs_candidates(id) ON DELETE CASCADE,
  sub_module_id UUID NOT NULL REFERENCES public.dhs_sub_modules(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  instructor_id TEXT,
  comment TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Competitions table
CREATE TABLE public.dhs_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('externe', 'interne')),
  specialty TEXT,
  max_score INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  is_entry_test BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Competition Questions table
CREATE TABLE public.dhs_competition_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.dhs_competitions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('qcm', 'text', 'section')),
  options JSONB,
  correct_answer TEXT,
  max_points INTEGER DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Competition Participations table
CREATE TABLE public.dhs_competition_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.dhs_competitions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_rio TEXT,
  answers JSONB NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  max_possible_score INTEGER NOT NULL DEFAULT 0,
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Application Forms table
CREATE TABLE public.dhs_application_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  fields JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Applications table
CREATE TABLE public.dhs_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.dhs_application_forms(id) ON DELETE CASCADE,
  form_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  server_id TEXT NOT NULL,
  responses JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  total_score INTEGER DEFAULT 0,
  max_possible_score INTEGER DEFAULT 0,
  reviewer_comment TEXT,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Agencies table
CREATE TABLE public.dhs_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Grades table
CREATE TABLE public.dhs_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  agency_id UUID NOT NULL REFERENCES public.dhs_agencies(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  authority_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Police Agents table
CREATE TABLE public.dhs_police_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  badge_number TEXT NOT NULL,
  agency_id UUID NOT NULL REFERENCES public.dhs_agencies(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES public.dhs_grades(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'retired', 'training')),
  candidate_id UUID REFERENCES public.dhs_candidates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Specialized Trainings table
CREATE TABLE public.dhs_specialized_trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  agency_id UUID NOT NULL REFERENCES public.dhs_agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Training Modules table
CREATE TABLE public.dhs_training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.dhs_specialized_trainings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  max_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Agent Trainings table
CREATE TABLE public.dhs_agent_trainings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.dhs_police_agents(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES public.dhs_specialized_trainings(id) ON DELETE CASCADE,
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  validated_by TEXT NOT NULL,
  score INTEGER,
  completed_modules TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Disciplinary Records table
CREATE TABLE public.dhs_disciplinary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.dhs_police_agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('warning', 'reprimand', 'suspension', 'termination')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE,
  reason TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Disciplinary Templates table
CREATE TABLE public.dhs_disciplinary_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'reprimand', 'suspension', 'termination')),
  content TEXT NOT NULL,
  agency_id UUID REFERENCES public.dhs_agencies(id),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Specialties table
CREATE TABLE public.dhs_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  agency_id UUID NOT NULL REFERENCES public.dhs_agencies(id) ON DELETE CASCADE,
  module_ids TEXT[] DEFAULT '{}',
  competition_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DHS Webhook Config table
CREATE TABLE public.dhs_webhook_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  class_creation_url TEXT,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_dhs_candidates_server_id ON public.dhs_candidates(server_id);
CREATE INDEX idx_dhs_sub_module_scores_candidate_id ON public.dhs_sub_module_scores(candidate_id);
CREATE INDEX idx_dhs_sub_module_scores_sub_module_id ON public.dhs_sub_module_scores(sub_module_id);
CREATE INDEX idx_dhs_competition_participations_competition_id ON public.dhs_competition_participations(competition_id);
CREATE INDEX idx_dhs_applications_form_id ON public.dhs_applications(form_id);
CREATE INDEX idx_dhs_police_agents_agency_id ON public.dhs_police_agents(agency_id);
CREATE INDEX idx_dhs_police_agents_grade_id ON public.dhs_police_agents(grade_id);
CREATE INDEX idx_dhs_disciplinary_records_agent_id ON public.dhs_disciplinary_records(agent_id);


-- Corriger et étendre la table des agents avec les nouveaux champs
ALTER TABLE public.dhs_police_agents 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS address text;

-- Créer la table pour les connexions des agents
CREATE TABLE IF NOT EXISTS public.dhs_agent_logins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.dhs_police_agents(id) ON DELETE CASCADE,
  badge_number text NOT NULL UNIQUE,
  password text NOT NULL,
  last_login timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Créer la table pour les tenues
CREATE TABLE IF NOT EXISTS public.dhs_uniforms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  agency_id uuid REFERENCES public.dhs_agencies(id),
  mask_facial_hair integer DEFAULT 1,
  hands_upper_body integer DEFAULT 5,
  legs_pants integer DEFAULT 21,
  bags_parachutes integer DEFAULT 18,
  shoes integer DEFAULT 19,
  neck_scarfs integer DEFAULT 317,
  shirt_accessories integer DEFAULT 58,
  body_armor_accessories integer DEFAULT 228,
  badges_logos text,
  shirt_overlay_jackets integer DEFAULT 31,
  hats_helmets integer DEFAULT 46,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Créer la table pour les messages internes
CREATE TABLE IF NOT EXISTS public.dhs_internal_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.dhs_police_agents(id),
  sender_email text NOT NULL,
  recipient_emails text[] NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  is_group_message boolean DEFAULT false,
  mailing_list_id uuid,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  read_by uuid[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Créer la table pour les listes de diffusion
CREATE TABLE IF NOT EXISTS public.dhs_mailing_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  member_emails text[] NOT NULL DEFAULT '{}',
  created_by text NOT NULL,
  agency_id uuid REFERENCES public.dhs_agencies(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_agent_logins_badge ON public.dhs_agent_logins(badge_number);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender ON public.dhs_internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_sent_at ON public.dhs_internal_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_uniforms_agency ON public.dhs_uniforms(agency_id);

-- Fonction pour générer l'email automatiquement
CREATE OR REPLACE FUNCTION public.generate_agent_email(agent_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  email_address text;
BEGIN
  -- Remplacer les espaces par des points et mettre en minuscules
  email_address := lower(replace(trim(agent_name), ' ', '.')) || '@noose.gov';
  RETURN email_address;
END;
$$;

-- Trigger pour générer automatiquement l'email lors de la création d'un agent
CREATE OR REPLACE FUNCTION public.set_agent_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    NEW.email := public.generate_agent_email(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_set_agent_email ON public.dhs_police_agents;
CREATE TRIGGER trigger_set_agent_email
  BEFORE INSERT OR UPDATE ON public.dhs_police_agents
  FOR EACH ROW EXECUTE FUNCTION public.set_agent_email();

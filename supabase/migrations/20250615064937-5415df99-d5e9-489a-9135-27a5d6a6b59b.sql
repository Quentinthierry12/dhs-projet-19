
-- Supprimer les anciennes fonctions et tables si elles existent
DROP FUNCTION IF EXISTS generate_unique_login_identifier();
DROP FUNCTION IF EXISTS generate_secure_password();
DROP TABLE IF EXISTS public.dhs_competition_invitations;

-- Modifier la table dhs_competitions pour supporter le type 'privé'
ALTER TABLE public.dhs_competitions 
DROP CONSTRAINT IF EXISTS dhs_competitions_type_check;

ALTER TABLE public.dhs_competitions 
ADD CONSTRAINT dhs_competitions_type_check 
CHECK (type IN ('externe', 'interne', 'privé'));

-- Créer la table pour les invitations aux concours privés
CREATE TABLE public.dhs_competition_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES public.dhs_competitions(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  candidate_email text,
  login_identifier text NOT NULL UNIQUE,
  login_password text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'used')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  UNIQUE(competition_id, candidate_name)
);

-- Ajouter des index pour optimiser les recherches
CREATE INDEX idx_competition_invitations_competition_id ON public.dhs_competition_invitations(competition_id);
CREATE INDEX idx_competition_invitations_login_identifier ON public.dhs_competition_invitations(login_identifier);

-- Fonction pour générer un identifiant unique
CREATE OR REPLACE FUNCTION generate_unique_login_identifier()
RETURNS TEXT AS $$
DECLARE
  identifier TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Générer un identifiant de 8 caractères alphanumériques
    identifier := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Vérifier s'il existe déjà
    SELECT EXISTS(SELECT 1 FROM dhs_competition_invitations WHERE login_identifier = identifier) INTO exists_check;
    
    -- Si l'identifiant n'existe pas, on peut l'utiliser
    IF NOT exists_check THEN
      RETURN identifier;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un mot de passe sécurisé en CLAIR (sans hachage)
CREATE OR REPLACE FUNCTION generate_secure_password()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  password TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    password := password || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN password;
END;
$$ LANGUAGE plpgsql;

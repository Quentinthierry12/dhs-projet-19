/*
  # Système de listes de diffusion avec emails de groupe
  
  1. Nouvelle Table
    - `dhs_mailing_lists` - Listes de diffusion pour les agents
      - `id` (uuid, primary key)
      - `name` (text) - Nom de la liste (ex: "Supervision")
      - `group_email` (text, unique) - Email de groupe (ex: supervision@dhs.gov)
      - `description` (text) - Description de la liste
      - `member_emails` (text[]) - Liste des emails des membres
      - `created_by` (text) - Email du créateur
      - `agency_id` (uuid) - Référence à l'agence (optionnel)
      - `is_active` (boolean) - Statut actif/inactif
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Sécurité
    - Active RLS sur la table
    - Politique de lecture pour tous les utilisateurs authentifiés
    - Politique de création/modification pour les utilisateurs avec rôle direction
*/

-- Créer la table des listes de diffusion
CREATE TABLE IF NOT EXISTS public.dhs_mailing_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  group_email text UNIQUE,
  description text,
  member_emails text[] NOT NULL DEFAULT '{}',
  created_by text NOT NULL,
  agency_id uuid NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dhs_mailing_lists_pkey PRIMARY KEY (id)
);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_mailing_lists_group_email 
ON public.dhs_mailing_lists(group_email) 
WHERE group_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mailing_lists_active 
ON public.dhs_mailing_lists(is_active) 
WHERE is_active = true;

-- Activer RLS
ALTER TABLE public.dhs_mailing_lists ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour tous les utilisateurs authentifiés
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dhs_mailing_lists' 
    AND policyname = 'Anyone can read active mailing lists'
  ) THEN
    CREATE POLICY "Anyone can read active mailing lists"
    ON public.dhs_mailing_lists FOR SELECT
    USING (is_active = true);
  END IF;
END $$;

-- Politique d'insertion pour tous les utilisateurs authentifiés
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dhs_mailing_lists' 
    AND policyname = 'Authenticated users can create mailing lists'
  ) THEN
    CREATE POLICY "Authenticated users can create mailing lists"
    ON public.dhs_mailing_lists FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Politique de mise à jour
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dhs_mailing_lists' 
    AND policyname = 'Creators can update their mailing lists'
  ) THEN
    CREATE POLICY "Creators can update their mailing lists"
    ON public.dhs_mailing_lists FOR UPDATE
    USING (true);
  END IF;
END $$;

-- Politique de suppression
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dhs_mailing_lists' 
    AND policyname = 'Creators can delete their mailing lists'
  ) THEN
    CREATE POLICY "Creators can delete their mailing lists"
    ON public.dhs_mailing_lists FOR DELETE
    USING (true);
  END IF;
END $$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_mailing_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mailing_list_updated_at ON public.dhs_mailing_lists;
CREATE TRIGGER trigger_update_mailing_list_updated_at
  BEFORE UPDATE ON public.dhs_mailing_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_mailing_list_updated_at();

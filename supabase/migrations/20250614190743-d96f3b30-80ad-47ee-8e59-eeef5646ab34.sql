
-- Ajouter des champs pour l'instructeur en charge dans les modules
ALTER TABLE dhs_modules ADD COLUMN instructor_in_charge text;

-- Ajouter des champs pour les sous-modules optionnels et les appréciations
ALTER TABLE dhs_sub_modules ADD COLUMN is_optional boolean DEFAULT false;
ALTER TABLE dhs_sub_modules ADD COLUMN appreciation text;

-- Ajouter une table pour les appréciations des sous-modules par candidat
CREATE TABLE dhs_sub_module_appreciations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  sub_module_id uuid NOT NULL,
  appreciation text,
  instructor_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(candidate_id, sub_module_id)
);

-- Ajouter des commentaires pour clarifier les nouveaux champs
COMMENT ON COLUMN dhs_modules.instructor_in_charge IS 'Nom de l''instructeur responsable du module';
COMMENT ON COLUMN dhs_sub_modules.is_optional IS 'Indique si le sous-module est optionnel';
COMMENT ON COLUMN dhs_sub_modules.appreciation IS 'Appréciation générale du sous-module';
COMMENT ON TABLE dhs_sub_module_appreciations IS 'Appréciations individuelles des candidats pour chaque sous-module';


-- Créer une table pour associer les agents aux spécialités
CREATE TABLE public.dhs_agent_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  specialty_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, specialty_id)
);

-- Modifier la table des formations agents pour améliorer la structure
ALTER TABLE public.dhs_agent_trainings 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS assigned_by TEXT;

-- Ajouter des contraintes pour s'assurer de l'intégrité des données
ALTER TABLE public.dhs_agent_specialties
ADD CONSTRAINT fk_agent_specialties_agent FOREIGN KEY (agent_id) REFERENCES dhs_police_agents(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_agent_specialties_specialty FOREIGN KEY (specialty_id) REFERENCES dhs_specialties(id) ON DELETE CASCADE;

ALTER TABLE public.dhs_agent_trainings
ADD CONSTRAINT fk_agent_trainings_agent FOREIGN KEY (agent_id) REFERENCES dhs_police_agents(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_agent_trainings_training FOREIGN KEY (training_id) REFERENCES dhs_specialized_trainings(id) ON DELETE CASCADE;
